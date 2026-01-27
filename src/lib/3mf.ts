import jsdom from 'jsdom';
import JSZip from 'jszip';
import { deepMerge, type DeepPartial } from './utils';

type _3mfFile = {
	name: string;
	fileThumbnail: Promise<File> | undefined;
	thumbnail: Promise<File> | undefined;
	filaments: {
		[k: string]: {
			color: string;
			type: string;
		}
	};
	plates: Record<string, {
		name: string;
		thumbnail: Promise<File> | undefined;
		objects: number;
		filaments: string[];

		timeSeconds?: number;
		weightGrams?: number;
	}>;
};

function xmlToDoc(xml: string) {
	if (typeof window !== 'undefined') {
		return new DOMParser().parseFromString(xml, 'text/xml');
	}
	const dom = new jsdom.JSDOM(xml, { contentType: 'text/xml' });
	return dom.window.document;
}

async function read3mfThumbnail(zip: JSZip): Promise<DeepPartial<_3mfFile>> {
	const zipFile = zip.file("Auxiliaries/.thumbnails/thumbnail_middle.png") ?? zip.file("Auxiliaries/.thumbnails/thumbnail_3mf.png");
	const fileThumbnail = zipFile?.async('blob')?.then(blob => new File([blob], zipFile.name, { type: `image/${zipFile.name.split('.').pop()}` }));
	return { fileThumbnail };
}

async function read3dModel(zip: JSZip): Promise<DeepPartial<_3mfFile>> {
	const zipFile = zip.file('3D/3dmodel.model');
	if (!zipFile) return {};

	const doc = xmlToDoc(await zipFile.async('text'));
	const model = doc.querySelector('model');
	const name = model?.querySelector('metadata[name="Title"]')?.textContent ?? '';
	const thumbnail_file = model?.querySelector('metadata[name="Thumbnail_Middle"]')?.textContent ?? '';
	const thumbnailZipFile = thumbnail_file ? zip.file(thumbnail_file.replace(/^[\\/]/, '')) ?? undefined : undefined;
	const thumbnail = thumbnailZipFile?.async('blob').then(blob => new File([blob], thumbnailZipFile.name, { type: `image/${thumbnail_file.split('.').pop()}` }));
	return { name, thumbnail };
}

async function readProjectSettings(zip: JSZip): Promise<DeepPartial<_3mfFile>> {
	const zipFile = zip.file('Metadata/project_settings.config');
	if (!zipFile) return {};

	const doc = JSON.parse(await zipFile.async('text'));
	const filamentSelfIndex = doc["filament_self_index"] as string[];
	const filamentTypes = doc["filament_type"] as string[];
	const filamentColors = doc["filament_colour"] as string[];

	const filaments = Object.fromEntries(filamentSelfIndex.map((selfIndex, i) => ([selfIndex, { color: filamentColors[i], type: filamentTypes[i] }])));
	return { filaments };
}

async function readModelSettings(zip: JSZip): Promise<DeepPartial<_3mfFile>> {
	const zipFile = zip.file('Metadata/model_settings.config');
	if (!zipFile) return {};

	const doc = xmlToDoc(await zipFile.async('text'));

	const plates = Object.fromEntries(await Promise.all(doc.querySelectorAll('config > plate').values().map(async plate => {
		const id = plate.querySelector('metadata[key=plater_id]')?.getAttribute('value') ?? '';
		const name = plate.querySelector('metadata[key=name]')?.getAttribute('value') ?? '';
		const thumbnail_file = plate.querySelector('metadata[key=thumbnail_file]')?.getAttribute('value') ?? '';
		const thumbnail = (thumbnail_file ? zip.file(thumbnail_file)?.async('blob') : undefined)?.then(blob => new File([blob], thumbnail_file, { type: `image/${thumbnail_file.split('.').pop()}` }));
		const gcodeFile = plate.querySelector('metadata[key=gcode_file]')?.getAttribute('value') ?? undefined;
		const objects = plate.querySelectorAll('model_instance').length;
		const filaments = [...new Set(plate.querySelectorAll('model_instance > metadata[key=object_id]').values().map(metadata => {
			const objectId = metadata.getAttribute('value');
			const object = doc.querySelector(`config > object[id="${objectId}"]`);
			const filaments = [];
			const objectExtruder = object?.querySelector('metadata[key=extruder]')?.getAttribute('value');
			if (objectExtruder) filaments.push(objectExtruder);
			object?.querySelectorAll('part > metadata[key=extruder]').forEach(metadata => {
				const extruder = metadata.getAttribute('value');
				if (extruder) filaments.push(extruder);
			});
			return filaments;
		}).toArray().flat())];
		return [id, { name, thumbnail, objects, filaments, ...(gcodeFile ? await readGcodeInfo(zip, gcodeFile) : {}) }]
	})));
	return { plates }
}

async function readSliceInfo(zip: JSZip): Promise<DeepPartial<_3mfFile>> {
	const zipFile = zip.file('Metadata/slice_info.config');
	if (!zipFile) return {};

	const doc = xmlToDoc(await zipFile.async('text'));

	const filaments: Record<string, { color: string, type: string }> = {};
	const plates = Object.fromEntries(doc.querySelectorAll('config > plate').values().map(plate => {
		const id = plate.querySelector("metadata[key=index]")?.getAttribute('value') ?? '';
		const weightGramsStr = plate.querySelector("metadata[key=weight]")?.getAttribute('value') ?? undefined;
		const weightGrams = weightGramsStr === undefined ? undefined : parseFloat(weightGramsStr);
		const objects = plate.querySelectorAll('object').length;

		const filamentIds = [];
		for (const filament of plate.querySelectorAll('filament').values()) {
			const id = filament.getAttribute('id') ?? '';
			const color = filament.getAttribute('color') ?? '';
			const type = filament.getAttribute('type') ?? '';
			filaments[id] = { color, type };
			filamentIds.push(id);
		}
		return [id, { ...(weightGrams ? { weightGrams } : {}), objects, filaments: filamentIds }]
	}));

	return { filaments, plates };
}

async function readGcodeInfo(zip: JSZip, gcodePath: string): Promise<DeepPartial<_3mfFile['plates'][number]>> {
	const zipFile = zip.file(gcodePath);
	if (!zipFile) return {};

	const text = await zipFile.async('text');

	const obj: { timeSeconds?: number, weightGrams?: number } = {};

	const timeMatch = text.match(/total estimated time:\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i);
	if (timeMatch) {
		const days = timeMatch[1] ? parseInt(timeMatch[1]) : 0;
		const hours = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
		const minutes = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
		const seconds = timeMatch[4] ? parseInt(timeMatch[4]) : 0;
		obj.timeSeconds = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
	}

	const weightMatch = text.match(/; filament used \[g\] = \s*(\d+(\.\d+)?)/i);
	if (weightMatch) {
		obj.weightGrams = parseFloat(weightMatch[1]);
	}
	return obj;
}

export async function analyze3mfFile(data: ArrayBuffer): Promise<_3mfFile> {
	const zip = await JSZip.loadAsync(data);

	const thumb = await read3mfThumbnail(zip);
	const _3dModel = await read3dModel(zip);
	const projectSettings = await readProjectSettings(zip);
	const modelSettings = await readModelSettings(zip);
	const sliceInfo = await readSliceInfo(zip);

	return [thumb, _3dModel, projectSettings, modelSettings, sliceInfo].reduce(deepMerge) as _3mfFile;
}
