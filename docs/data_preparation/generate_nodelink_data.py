import pandas as pd

df = pd.read_csv("blns2023.csv")
df['finalWorth'] = df['finalWorth']/1000
first50 = df[df['rank']<=20]
first50 = first50[['personName','finalWorth','country','industries', 'position']]
dic = first50.to_dict(orient ='records')
dic