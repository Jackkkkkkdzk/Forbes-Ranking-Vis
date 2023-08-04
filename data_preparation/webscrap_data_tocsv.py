import requests
import bs4
import pandas as pd

response2022 = requests.get("https://www.forbes.com/billionaires-2022/page-data/index/page-data.json").json()
billionaires = response2022['result']['pageContext']['tableData']
# billionaires
# len(billionaires)

df2022 = pd.DataFrame()
for billionaire in billionaires:
    df2022 = df2022.append(billionaire, ignore_index = True)
df2022 =df2022[['rank','position','personName','finalWorth',
        'age', 'country', 'state', 'city', 
        'source', 'industries','countryOfCitizenship','gender','title']]
# df2022
df2022.to_csv('blns2022.csv', index=False)


response2023 = requests.get('https://www.forbes.com/forbesapi/person/billionaires/2023/position/true.json').json()
# response2023
billionaires2023 = response2023['personList']['personsLists']
# len(billionaires2023)
df2023 = pd.DataFrame()
for billionaire in billionaires2023:
    df2023 = df2023.append(billionaire, ignore_index = True)
df2023 = df2023[['rank','position','personName', 'finalWorth','age', 'country', 'state','city', 'source',
       'industries', 'countryOfCitizenship','gender', 'title']]
# df2023
df2023.to_csv('blns2023.csv', index=False)