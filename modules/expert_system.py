"""
Modul Expert System untuk IGRS Analyzer
Forward chaining untuk menentukan rating game
"""

RATING_SCALE = ['3+', '7+', '13+', '15+', '18+']


def rating_to_index(rating):
    """Konversi rating string ke index"""
    try:
        return RATING_SCALE.index(rating)
    except ValueError:
        return 0


def run_expert_system(state):
    """
    Expert System dengan Forward Chaining
    
    Args:
        state: dict dengan keys:
            - flags: dict content detection flags
            - dominant: dict label dominan per aspek
            - hasAspect: dict ada/tidaknya konten per aspek
    
    Returns:
        dict dengan keys:
            - triggered: list of rules yang terpicu
            - expert_rating: rating akhir dari expert system
    """
    triggered = []
    suggested_max_index = 0
    
    def add_rule(rule_id, rule_text, rating):
        nonlocal suggested_max_index
        triggered.append({
            'id': rule_id,
            'text': rule_text,
            'rating': rating
        })
        suggested_max_index = max(suggested_max_index, rating_to_index(rating))
    
    flags = state.get('flags', {})
    dominant = state.get('dominant', {})
    has_aspect = state.get('hasAspect', {})
    
    has_violence = has_aspect.get('violence', False)
    has_horror = has_aspect.get('horror', False)
    has_language = has_aspect.get('language', False)
    has_sexual = has_aspect.get('sexual', False)
    
    # Rule 1: Gore + Violence Tinggi -> 18+
    if flags.get('gore') and dominant.get('violence') == 'high':
        add_rule('R1', 'IF gore = true AND violence_intensity = tinggi THEN rating = 18+', '18+')
    
    # Rule 2: Explicit + Sexual Medium/High -> 18+
    if flags.get('explicit') and dominant.get('sexual') in ['medium', 'high']:
        add_rule('R2', 'IF explicit = true AND sexual_intensity >= sedang THEN rating = 18+', '18+')
    
    # Rule 3: Heavy Profanity + Language Tinggi -> 15+
    if flags.get('heavy_profanity') and dominant.get('language') == 'high':
        add_rule('R3', 'IF heavy_profanity = true AND language_intensity = tinggi THEN rating = 15+', '15+')
    
    # Rule 4: Monster + Horror Tinggi -> 15+
    if flags.get('monster') and dominant.get('horror') == 'high':
        add_rule('R4', 'IF monster = true AND horror_intensity = tinggi THEN rating = 15+', '15+')
    
    # Rule 5: Weapon + Violence Medium/High -> 15+
    if flags.get('weapon') and dominant.get('violence') in ['medium', 'high']:
        add_rule('R5', 'IF weapon = true AND violence_intensity >= sedang THEN rating = 15+', '15+')
    
    # Rule 6: Jumpscare + Horror Medium -> 13+
    if flags.get('jumpscare') and dominant.get('horror') == 'medium':
        add_rule('R6', 'IF jumpscare = true AND horror_intensity = sedang THEN rating = 13+', '13+')
    
    # Rule 7: Suggestive + Sexual Medium -> 13+
    if flags.get('suggestive') and dominant.get('sexual') == 'medium':
        add_rule('R7', 'IF suggestive = true AND sexual_intensity = sedang THEN rating = 13+', '13+')
    
    # Rule 8: Bad Words + Language Medium -> 13+
    if flags.get('bad_words') and dominant.get('language') == 'medium':
        add_rule('R8', 'IF bad_words = true AND language_intensity = sedang THEN rating = 13+', '13+')
    
    # Rule 9: Blood + Violence Medium -> 13+
    if flags.get('blood') and dominant.get('violence') == 'medium':
        add_rule('R9', 'IF blood = true AND violence_intensity = sedang THEN rating = 13+', '13+')
    
    # Rule 10: Disturbing Imagery + Horror Medium -> 13+
    if flags.get('disturbing') and dominant.get('horror') == 'medium':
        add_rule('R10', 'IF disturbing = true AND horror_intensity = sedang THEN rating = 13+', '13+')
    
    # Rule 11: Ada konten tapi intensity dominan rendah -> 7+
    if (has_violence or has_horror or has_language or has_sexual) and suggested_max_index == 0:
        add_rule('R11', 'IF ada konten terdeteksi namun intensitas dominan rendah THEN rating = 7+', '7+')
    
    # Rule 12: Tidak ada konten apapun -> 3+
    if not has_violence and not has_horror and not has_language and not has_sexual:
        add_rule('R12', 'IF tidak ada kekerasan, horor, bahasa kasar, dan seksual THEN rating = 3+', '3+')
    
    return {
        'triggered': triggered,
        'expert_rating': RATING_SCALE[suggested_max_index]
    }
