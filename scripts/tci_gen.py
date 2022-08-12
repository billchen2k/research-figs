'''
@author: Bill Chen
@file: tci_gen.py
@created: 2022/8/11 17:17
'''
import json

val = [89.0311, 91.2837, 88.3017, 91.0131, 90.2491, 92.7509, 89.5462, 91.9168, 90.4407, 92.2815, 90.0418, 92.1063,
       91.4773, 93.5783, 89.7242, 92.2573, 90.6375, 92.7514, 90.6870, 92.6463, 90.3490, 92.4844, 91.4080, 93.3327,
       90.4257, 92.3891, 90.7521, 92.6924, 89.6936, 91.7138, 88.5464, 90.8054, 89.8406, 91.7335, 88.9106, 91.4412,
       90.0241, 92.1796]

header = ['Hand-drawn Sketch@Color', 'Hand-drawn Sketch@Position', 'Hand-drawn Sketch@Node',
          'Hand-drawn Sketch@Connection', 'Mindmap@Color', 'Mindmap@Position', 'Mindmap@Text', 'Mindmap@Node',
          'Mindmap@Connection', 'Modeling Graph@Color', 'Modeling Graph@Position', 'Modeling Graph@Text',
          'Modeling Graph@Node', 'Modeling Graph@Connection', 'Flowchart@Color', 'Flowchart@Position', 'Flowchart@Text',
          'Flowchart@Node', 'Flowchart@Connection']

tci = {}

for i, h in enumerate(header):
    type = h.split('@')[0]
    metric = h.split('@')[1]
    if not tci.get(type):
        tci[type] = {}
    tci[type][metric] = [val[i * 2], val[i * 2 + 1]]

with open('scoringTtestTCI.json', 'w') as f:
    json.dump(tci, f, indent=2)
