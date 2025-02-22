# Syntax
SQLSeal Charts uses [ECharts](https://echarts.apache.org/en/index.html) under the hood. It automatically exposes data returned by your SQL query as a `data` dataset in ECharts. This means you can generate plenty of charts without worrying too much about how the data is being passed down. For more complex use-cases, you can always refer to the data by column name, it's index or even filter it down to create separate data-sets for different series.
To read more about datasets, [check out ECharts documentation](https://apache.github.io/echarts-handbook/en/concepts/dataset/).

## Variables
In addition SQLSeal exposes data returned by SQLSeal Query in the following variables:
| Variable Name          | Description                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data`                 | Array of objects containing raw data                                                                                                             |
| `columns`              | array of column names                                                                                                                            |
| Object for each column | You can refer to each of the column data by their name, i.e. for `SELECT category, amount FROM data` you can use `category` and `amount` columns |

## Functions
Extra functions are exposed in SQLSeal Charts configuration object so you can use them:

| Function                                                            | Description                                                                                                                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `column(name: string)`                                              | Returns array of the values for a specified column                                                                                                   |
| `mean, max, min, uniq, uniqBy`                                      | [Lodash](https://lodash.com/docs/4.17.15) functions to help with data processing                                                                     |
| `array(...arrays)`                                                  | creates subarrays from arrays, i.e. `array([1,2], [3,4 ]) == [[1,3], [2,4]]`. Useful when grouping multiple columns together when reshaping the data |
| `assembleObjects(...definitions: { key: string, values: array }[])` | Assembles multiple arrays into array of objects using provided key values                                                                            |
| `assemble(definition: Record<string, array>)`                       | Assembles multiple arrays into array of objects using a key=>value map                                                                               |

## JavaScript functionality
Configuration has some basic JavaScript capabilities. For security reasons not all JavaScript syntax is available. This will change and more functions will be exposed.
For now the following JavaScript syntax is enabled:
- Arrow functions, i.e: `() => column('data')`
- Template literals, i.e.: \`${column('data')[0]}\`

More functionality will get exposed soon.