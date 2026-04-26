"""
Smart IGRS Analyzer - Flask Backend
Hybrid Fuzzy Logic + Expert System untuk rating game IGRS
"""
import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from pathlib import Path
import json
from modules.fuzzy_logic import (
    fuzzify_all, dominant_label, fuzzy_inference, 
    defuzzify, fuzzy_score_to_rating, ASPECTS
)
from modules.expert_system import run_expert_system, rating_to_index, RATING_SCALE

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
SOURCE_DIR = Path(__file__).resolve().parent / 'source'


@app.route('/')
def index():
    """Render halaman utama"""
    return render_template('index.html')


@app.route('/source/<path:filename>')
def source_assets(filename):
    """Serve image assets dari folder source"""
    return send_from_directory(SOURCE_DIR, filename)


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    API endpoint untuk analisis IGRS
    
    Request JSON:
    {
        "contentFlags": {...},
        "intensities": {
            "violence": int,
            "horror": int,
            "language": int,
            "sexual": int
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        content_flags = data.get('contentFlags', {})
        intensities = data.get('intensities', {})
        
        # Validate intensities
        for aspect in ['violence', 'horror', 'language', 'sexual']:
            if aspect not in intensities:
                intensities[aspect] = 0
            intensities[aspect] = max(0, min(10, int(intensities[aspect])))
        
        result = analyze_igrs(content_flags, intensities)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


def analyze_igrs(content_flags, intensities):
    """
    Orkestrasi analisis fuzzy logic + expert system
    """
    # Step 1: Fuzzify input intensities
    all_fuzzy = fuzzify_all(intensities)
    
    # Step 2: Determine dominant labels
    dominant = {}
    has_aspect = {}
    for aspect_key in ASPECTS.keys():
        dominant[aspect_key] = dominant_label(all_fuzzy[aspect_key])
        has_aspect[aspect_key] = intensities.get(aspect_key, 0) > 0
    
    # Step 3: Fuzzy inference
    fuzzy_output = fuzzy_inference(all_fuzzy)
    
    # Step 4: Defuzzify
    fuzzy_score = defuzzify(fuzzy_output)
    fuzzy_rating = fuzzy_score_to_rating(fuzzy_score)
    
    # Step 5: Expert system (forward chaining)
    expert_result = run_expert_system({
        'flags': content_flags,
        'dominant': dominant,
        'hasAspect': has_aspect
    })
    
    # Step 6: Combine results (take max rating)
    final_index = max(
        rating_to_index(fuzzy_rating),
        rating_to_index(expert_result['expert_rating'])
    )
    final_rating = RATING_SCALE[final_index]
    
    # Build explanation
    explanation = (
        f"Rating akhir {final_rating} ditetapkan dari kombinasi hasil fuzzy "
        f"({fuzzy_rating}, skor {fuzzy_score:.2f}) dan expert system "
        f"({expert_result['expert_rating']}) dengan {len(expert_result['triggered'])} rule terpicu."
    )
    
    return {
        'finalRating': final_rating,
        'intensities': intensities,
        'allFuzzy': all_fuzzy,
        'triggeredRules': expert_result['triggered'],
        'fuzzyScore': fuzzy_score,
        'fuzzyRating': fuzzy_rating,
        'expertRating': expert_result['expert_rating'],
        'explanation': explanation
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
