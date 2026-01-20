import products from "./products";
import uploads from "./uploads";

export default [
  {
    id: 'f7a6f4e6-b717-4c26-a479-6ac60c081fd8',
    versionName: 'Marcadores de gatitos',
    versionNotes: '',
    productId: products[0].id,
    thumbnailId: uploads[1].id,
    fileId: uploads[0].id,
    createdAt: new Date("2026-01-19T17:56:00-03:00")
  },
  {
    id: 'f7a6f4e6-b717-4c26-a479-6ac60c081fd9',
    versionName: 'Marcadores de gatitos',
    versionNotes: 'Minor changes: \n- Added support for 4MF files\n- Fixed a bug in the slicing algorithm',
    productId: products[0].id,
    thumbnailId: uploads[1].id,
    fileId: uploads[0].id,
    createdAt: new Date("2026-01-19T17:56:05-03:00")
  },
  {
    id: 'f7a6f4e6-b717-4c26-a479-6ac60c081fda',
    versionName: 'Cajita para tarjetas',
    versionNotes: 'lmao',
    productId: products[1].id,
    thumbnailId: uploads[1].id,
    fileId: null,
    createdAt: new Date("2026-01-19T17:58:00-03:00")
  }
];