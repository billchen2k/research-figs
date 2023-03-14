import pandas as pd
import json

data = pd.read_excel('data/GVQAQuestionnaire.xlsx')
tci_data = pd.read_excel('data/GVQATTest.xlsx', sheet_name='t')

questions = [f'Q{i}' for i in range(1, 13)]
mode=['text', 'visual']
metrics = ['usefulness', 'transparency']

col_id = 0
tci = {}
for i in questions:
    for j in mode:
        for k in metrics:
            column_head = f'{i}@{j}@{k}'
            data.rename(columns={data.columns[col_id]: column_head}, inplace=True)
            tci_low = tci_data.iloc[col_id, 0]
            tci_high = tci_data.iloc[col_id, 1]
            tci[column_head] = {
                'low': tci_low,
                'high': tci_high
            }
            col_id += 1

data.to_csv('public/data/gvqaQuestionnaire.csv', index=False)
json.dump(tci, open('public/data/gvqaTCI.json', 'w'), indent=2)