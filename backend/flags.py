import re


def check_flags(title, description, company, salary_range, email):
    flags = []

    title = (title or "").lower()
    description = (description or "").lower()
    company = (company or "").lower().strip()
    salary_range = (salary_range or "").lower()
    email = (email or "").lower()

    # Check if recruiter is using a free/personal email instead of a corporate domain
    generic_domains = ["gmail", "yahoo", "hotmail", "rediffmail", "ymail"]
    if any(domain in email for domain in generic_domains):
        flags.append("Generic email domain detected")

    # Job descriptions that are too short often indicate low-effort scam postings
    word_count = len(description.split())
    if word_count < 50:
        flags.append("Very short job description")

    # Pressure tactics are a common sign of fraudulent postings
    urgency_phrases = [
        "urgent", "immediate joiner", "join today", "same day",
        "apply now", "limited seats", "hurry",
    ]
    combined_text = title + " " + description
    if any(phrase in combined_text for phrase in urgency_phrases):
        flags.append("Urgency language detected")

    # Legitimate jobs rarely advertise daily/weekly pay or absurdly high figures
    suspicious_pay_terms = ["per day", "daily", "weekly pay", "per week"]
    has_suspicious_term = any(term in salary_range for term in suspicious_pay_terms)
    has_high_number = any(int(n) > 200000 for n in re.findall(r"\d+", salary_range))
    if has_suspicious_term or has_high_number:
        flags.append("Unrealistic salary promise")

    # Real employers never ask for fees or sensitive documents upfront
    document_fee_phrases = [
        "registration fee", "aadhar", "pan card", "deposit",
        "bank details", "processing fee", "training fee",
    ]
    if any(phrase in description for phrase in document_fee_phrases):
        flags.append("Asking for personal documents or fees")

    # Excessive exclamation marks signal unprofessional or scam-like postings
    if description.count("!") > 4:
        flags.append("Too many exclamation marks")

    # Missing company name is a red flag for anonymous/fake recruiters
    if len(company) < 2:
        flags.append("No company name provided")

    return flags
