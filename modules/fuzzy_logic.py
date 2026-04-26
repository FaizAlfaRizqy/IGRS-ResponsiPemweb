"""
Modul Fuzzy Logic untuk IGRS Analyzer
Implementasi membership functions dan fuzzy inference
"""

ASPECTS = {
    'violence': {
        'label': 'Violence',
        'membership': {
            'low': (0, 0, 4),
            'medium': (2, 5, 8),
            'high': (6, 10, 10)
        }
    },
    'horror': {
        'label': 'Horror',
        'membership': {
            'low': (0, 0, 4),
            'medium': (2, 5, 8),
            'high': (6, 10, 10)
        }
    },
    'language': {
        'label': 'Language',
        'membership': {
            'low': (0, 0, 4),
            'medium': (2, 5, 8),
            'high': (6, 10, 10)
        }
    },
    'sexual': {
        'label': 'Sexual Content',
        'membership': {
            'low': (0, 0, 4),
            'medium': (2, 5, 8),
            'high': (6, 10, 10)
        }
    }
}


def clamp(value):
    """Clamp nilai antara 0 dan 1"""
    return max(0, min(1, value))


def triangular_membership(x, params):
    """
    Triangular membership function
    params = (a, b, c) dimana:
    - a = left peak
    - b = center peak
    - c = right peak
    """
    a, b, c = params
    
    if b == a and x <= b:
        return max((c - x) / (c - b if c != b else 1), 0)
    if b == c and x >= b:
        return max((x - a) / (b - a if b != a else 1), 0)
    if x <= a or x >= c:
        return 0
    if x == b:
        return 1
    if x < b:
        return (x - a) / (b - a)
    return (c - x) / (c - b)


def fuzzify_aspect(aspect_key, intensity):
    """
    Fuzzification: konversi input crisp ke fuzzy membership
    """
    if aspect_key not in ASPECTS:
        return {'low': 0, 'medium': 0, 'high': 0}
    
    shape = ASPECTS[aspect_key]['membership']
    
    return {
        'low': clamp(triangular_membership(intensity, shape['low'])),
        'medium': clamp(triangular_membership(intensity, shape['medium'])),
        'high': clamp(triangular_membership(intensity, shape['high']))
    }


def fuzzify_all(intensities):
    """Fuzzify semua aspek"""
    result = {}
    for aspect_key in ASPECTS.keys():
        intensity = intensities.get(aspect_key, 0)
        result[aspect_key] = fuzzify_aspect(aspect_key, intensity)
    return result


def dominant_label(degrees):
    """Tentukan label dominan (low/medium/high) berdasarkan membership terbesar"""
    max_key = 'low'
    max_value = degrees['low']
    
    for label in ['medium', 'high']:
        if degrees[label] > max_value:
            max_value = degrees[label]
            max_key = label
    
    return max_key


def fuzzy_inference(all_fuzzy):
    """
    Fuzzy Inference: kombinasi membership semua aspek
    Menggunakan max untuk output inference
    """
    all_aspects = list(all_fuzzy.values())
    
    highs = [asp['high'] for asp in all_aspects]
    mediums = [asp['medium'] for asp in all_aspects]
    lows = [asp['low'] for asp in all_aspects]
    
    return {
        'low': clamp(min(lows)),
        'medium': clamp(max(mediums)),
        'high': clamp(max(highs))
    }


def output_membership(x, label):
    """Output membership function untuk defuzzification"""
    if label == 'low':
        return triangular_membership(x, (0, 0, 40))
    elif label == 'medium':
        return triangular_membership(x, (30, 50, 70))
    else:  # high
        return triangular_membership(x, (60, 100, 100))


def defuzzify(inference):
    """
    Defuzzification: konversi fuzzy output ke crisp value
    Menggunakan metode centroid
    """
    numerator = 0
    denominator = 0
    
    for x in range(0, 101):
        low_cut = min(inference['low'], output_membership(x, 'low'))
        med_cut = min(inference['medium'], output_membership(x, 'medium'))
        high_cut = min(inference['high'], output_membership(x, 'high'))
        aggregate = max(low_cut, med_cut, high_cut)
        
        numerator += x * aggregate
        denominator += aggregate
    
    return numerator / denominator if denominator > 0 else 0


def fuzzy_score_to_rating(score):
    """Konversi fuzzy score (0-100) ke rating IGRS"""
    if score < 15:
        return '3+'
    elif score < 30:
        return '7+'
    elif score < 55:
        return '13+'
    elif score < 75:
        return '15+'
    else:
        return '18+'
