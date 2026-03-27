# models/

Place your two trained model artefacts here before starting the server.

| File | Description |
|------|-------------|
| `tomato_disease_resnet50.pth` | PyTorch state-dict saved with `torch.save(model.state_dict(), ...)` |
| `class_metadata.json` | JSON file saved from the notebook with class names, index mapping, and preprocessing stats |

## Expected `class_metadata.json` structure

```json
{
  "class_names":  ["Tomato___Bacterial_spot", "Tomato___Early_blight", ...],
  "class_to_idx": {"Tomato___Bacterial_spot": 0, ...},
  "idx_to_class": {"0": "Tomato___Bacterial_spot", ...},
  "num_classes":  10,
  "img_size":     224,
  "mean":         [0.485, 0.456, 0.406],
  "std":          [0.229, 0.224, 0.225]
}
```

These files are excluded from Git via `.gitignore` because the `.pth`
file is typically 100 MB+. Store them in cloud storage or share them
out-of-band with team members.
