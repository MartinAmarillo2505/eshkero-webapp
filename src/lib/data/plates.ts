import models from "./models";
import uploads from "./uploads";

export default [
  {
    id: '715d3a75-6cf9-4760-a3ba-db46b1a8c4b0',
    modelId: models[0].id,
    name: "Placa 1",
    thumbnailId: uploads[1].id,
    timeSeconds: 5 * 60,
    weightGrams: 20,
    objects: 1,
    filaments: [
      { type: "PLA", color: "#FF0000" },
      { type: "ABS", color: "#00FF00" },
      { type: "PETG", color: "#0000FF" },
      { type: "TPU", color: "#FFFF00" }
    ]
  },
  {
    id: '715d3a75-6cf9-4760-a3ba-db46b1a8c4b1',
    modelId: models[0].id,
    name: "Placa 2",
    thumbnailId: null,
    timeSeconds: 2 * 60,
    weightGrams: 15,
    objects: 1,
    filaments: [
      { type: "PLA", color: "#FF0000" },
      { type: "ABS", color: "#00FF00" },
      { type: "PETG", color: "#0000FF" },
      { type: "TPU", color: "#FFFF00" }
    ]
  },
  {
    id: '715d3a75-6cf9-4760-a3ba-db46b1a8c4b2',
    modelId: models[1].id,
    name: "Placa 1",
    thumbnailId: null,
    timeSeconds: 10 * 60,
    weightGrams: 25,
    objects: 1,
    filaments: [
      { type: "PLA", color: "#FF0000" },
      { type: "ABS", color: "#00FF00" },
      { type: "PETG", color: "#0000FF" },
      { type: "TPU", color: "#FFFF00" }
    ]
  },
  {
    id: '715d3a75-6cf9-4760-a3ba-db46b1a8c4b3',
    modelId: models[2].id,
    name: "Placa 2",
    thumbnailId: null,
    timeSeconds: 15 * 60,
    weightGrams: 100,
    objects: 5,
    filaments: [
      { type: "PLA", color: "#FF0000" },
      { type: "ABS", color: "#00FF00" },
      { type: "PETG", color: "#0000FF" },
      { type: "TPU", color: "#FFFF00" }
    ]
  },

]