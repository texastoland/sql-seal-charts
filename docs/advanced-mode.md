# Advanced Mode
You can turn on Advanced mode which will enable you to write pure JavaScript. You have access to your query result and helper functions inside it so you can use it to transform your data, perform additional logic, etc.
In advanced mode you need to return manually the object that will be used as a chart configuration in the end.

## Example

More advanced examples to be added later.

```sqlseal
ADVANCED MODE
-- now you can use all JavaScript syntax to your heart content
CHART 
    const values = (new Array(5)).map((_, i) => i)
	return {
        tooltip: {},
        legend: {
          data: ['sales']
        },
        xAxis: {
          data: ['Shirts', 'Cardigans', 'Chiffons', 'Pants', 'Heels', 'Socks']
        },
        yAxis: {},
        series: [
          {
            name: 'sales',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      }

SELECT * FROM files
```