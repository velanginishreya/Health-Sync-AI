from app.services.safety_service import SafetyService

def test_emergency_safety_intercept():
    eval_res = SafetyService.evaluate_user_query("I am having severe chest pain and difficulty breathing")
    assert eval_res["is_emergency"] is True
    assert eval_res["urgency"] == "EMERGENCY"
    assert "EMERGENCY WARNING" in eval_res["override_response"]

def test_dosage_modification_intercept():
    eval_res = SafetyService.evaluate_user_query("Should I double my medicine dose today?")
    assert eval_res["is_emergency"] is False
    assert eval_res["urgency"] == "HIGH"
    assert "Medication Safety Alert" in eval_res["override_response"]

def test_diagnosis_demand_intercept():
    eval_res = SafetyService.evaluate_user_query("What disease do I have?")
    assert eval_res["is_safe"] is True
    assert "cannot diagnose medical conditions" in eval_res["override_response"]

def test_mandatory_disclaimer_injection():
    sanitized = SafetyService.sanitize_ai_response("Your blood pressure is within expected limits.", {"override_response": None})
    assert "Disclaimer: This information is for educational and informational purposes" in sanitized
