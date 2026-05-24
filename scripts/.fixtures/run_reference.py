"""Wrapper around empress_his_engine_reference.py for parity testing."""
import sys
import json
import importlib.util
import pathlib

HERE = pathlib.Path(__file__).parent
spec = importlib.util.spec_from_file_location(
    "ref", str(HERE / "empress_his_engine_reference.py")
)
ref = importlib.util.module_from_spec(spec)
sys.modules["ref"] = ref
spec.loader.exec_module(ref)

payload = json.loads(sys.argv[1])
responses = {int(k): v for k, v in payload["responses"].items()}
result = ref.run_assessment(
    responses,
    staging_response=payload["stagingResponse"],
    mht_active=payload.get("mhtActive", False),
)

out = {
    "stage": result.stage,
    "mhtActive": result.mht_active,
    "his": result.his,
    "hisBand": result.his_band,
    "domainScores": {int(k): v for k, v in result.domain_scores.items()},
    "domainBands": {int(k): v for k, v in result.domain_bands.items()},
    "excludedDomains": list(result.excluded_domains),
    "imputedDomains": list(result.imputed_domains),
    "effectiveWeights": {int(k): v for k, v in result.effective_weights.items()},
    "compositeFlag": result.composite_flag,
    "mhtFlag": result.mht_flag,
    "nAnswered": result.n_answered,
    "nMissing": result.n_missing,
    "assessmentValid": result.assessment_valid,
    "itemFlags": [
        {
            "question": f["question"],
            "label": f["label"],
            "rawScore": f["raw_score"],
            "domainId": f["domain_id"],
            "domainName": f["domain_name"],
            "priority": f["priority"],
            "referralText": f["referral_text"],
        }
        for f in result.item_flags
    ],
    "domainFlags": [
        {
            "domainId": f["domain_id"],
            "domainName": f["domain_name"],
            "domainScore": f["domain_score"],
            "message": f["message"],
        }
        for f in result.domain_flags
    ],
}
sys.stdout.write(json.dumps(out))
