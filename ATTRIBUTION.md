# Attribution

## 3D anatomy model (`public/model/`)

The 3D model is an adapted work and is licensed under
**Creative Commons Attribution 4.0 International (CC BY 4.0)** —
https://creativecommons.org/licenses/by/4.0/

> Anatomy: BodyParts3D © The Database Center for Life Science (DBCLS), CC BY 4.0.
> Prepared for the web by Human Atlas and published as `@dagno/anatomy-model` 0.1.2 (CC BY 4.0).
> Lungs and liver from `open-anatomy-3d` 0.1.0 (CC BY 4.0), itself adapted from BodyParts3D.
> Modified by MedPeriodic.

- BodyParts3D: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/ — Mitsuhashi et al. (2009),
  *BodyParts3D: 3D structure database for anatomical concepts*, Nucleic Acids Research, https://doi.org/10.1093/nar/gkn613
- Human Atlas / Anatomy Model: https://github.com/dagno-labs/anatomy-model
- open-anatomy-3d: https://github.com/MervinR07/open-anatomy-3d

### Changes made by MedPeriodic (`scripts/build-model.mjs`)

- Removed the two heart-chamber cavity volumes; reassigned the fibularis muscles and tensor fasciae latae
  to the muscle layer and the brain ventricles to the nervous layer.
- Added the left lung, right lung and liver from open-anatomy-3d, translated by the offset measured
  against the kidneys present in both models.
- Re-quantized positions to 16-bit per piece, normals to 8-bit, indices to 16-bit where possible,
  and regrouped the pieces into gzipped packs by body system.
- Recolored every piece with a textbook tissue palette at render time.

The models are for education and visualisation and are not suitable for diagnosis.

## Fonts

Oswald and Source Serif 4, served by Google Fonts under the SIL Open Font License.
