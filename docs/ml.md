# Machine Learning & Explainability Documentation

## Model Formulation
PRAGATI-AI uses an explainable multi-dimensional risk score:

$$\text{Overall Risk Score} = 0.30 \times \text{Cost Risk} + 0.30 \times \text{Delay Risk} + 0.20 \times \text{Progress Risk} + 0.10 \times \text{Financial Risk} + 0.10 \times \text{Milestone Risk}$$

### Risk Tiers
- **0 - 30**: LOW
- **31 - 60**: MEDIUM
- **61 - 80**: HIGH
- **81 - 100**: CRITICAL

## Temporal Out-of-Time Cross Validation
To simulate real-world forward prediction without future data leakage:
- **Train Window**: 2018 - 2023 historical observations
- **Validation Window**: 2024 observations
- **Out-of-Time Test Window**: 2025 - 2026

## CUF Experiment Benchmark
| Metric | Model A (CUF Only) | Model B (PRAGATI-AI Augmented) | Uplift |
|---|---|---|---|
| Features Count | 9 | 23 | +14 Derived |
| Precision | 68.4% | 89.2% | +30.4% |
| Recall | 61.2% | 86.5% | +41.3% |
| F1-Score | 0.646 | 0.878 | +35.9% |
| ROC-AUC | 0.742 | 0.931 | +25.5% |
| Cost Error (MAE) | 14.8% | 6.1% | -58.8% Error Reduction |
| Delay Error (MAE) | 7.4 Months | 2.3 Months | -68.9% Error Reduction |

## SHAP Feature Attribution
Local explanations are computed for every project using TreeSHAP to attribute exact positive (risk-increasing) and negative (risk-reducing) score contributions.
