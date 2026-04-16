def calculate_interest(principal: float, days_overdue: int, rate_per_week: float = 0.02) -> float:
    """
    Apply 2% interest per week ONLY if due > 10 days.
    Interest is compounded weekly.
    Days 1-10: No interest
    Day 11+: Interest starts, compounded weekly
    """
    if days_overdue <= 10:
        return 0.0
    
    effective_days = days_overdue - 10
    weeks = effective_days / 7
    interest = principal * ((1 + rate_per_week) ** weeks - 1)
    return round(interest, 2)