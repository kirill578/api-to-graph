import React, { useEffect } from 'react';
import { Box, CircularProgress, Paper } from '@material-ui/core'
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  LineSeries,
  ZoomAndPan,
  Legend,
} from '@devexpress/dx-react-chart-material-ui';
import { string } from 'prop-types';

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

function getMsSinceMidnight(d: number) {
  var e = new Date(d);
  return d - e.setHours(0, 0, 0, 0);
}

function timeConvert(n: number) {
  var num = n;
  var hours = (num / 60);
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  return rhours + ":" + rminutes;
  }

const toCustomLocaleString = (date: Date) =>
  date
      .toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
      })
      .replace(/:00/, '');

export const App = () => {
  const [data, setData] = React.useState<Record<string, { timestamp: number, value: number }[]>>({});

  useEffect(() => {
    const load = async () => {
      const fetched = await fetch(window.location.search.substr(1));
      const data: { timestamp: number, value: number }[] = (await fetched.json() as unknown[])
        .map(({ timestamp, value }: any) => ({
          timestamp,
          value: parseFloat(value)
        }))
        .filter(({ value }) => value > 10 && value < 35)


      const datas = data.reduce((pre, cur) => {
        const key = formatDate(new Date(cur.timestamp));
        return {
          ...pre,
          [key]: [cur, ...(pre[key] ? pre[key] : [])]
        }
      }, {} as Record<string, { timestamp: number, value: number }[]>);

      setData(datas);
    };
    load();
  }, [setData])

  console.log(data);

  const newData = Object.entries(data).reduce((pre, [key, array]) => {
      return [
        ...pre,
        ...array.map(({timestamp, value}) => {
          return {
            [key]: getMsSinceMidnight(timestamp),
            timestamp,
            value,
          }
        })
      ]
  }, [] as Record<string, string | number>[]);

  const allKeys = Object.keys(data);

  return (
    <Box position="absolute" left={0} top={0} right={0} bottom={0}>
      {data ?
        <Chart data={newData}>
          <Legend
          />

          <ArgumentAxis tickFormat={() => (ms: string) => {
            const minutes = parseInt(ms, 10) / 1000 / 60;
            const d = new Date();
            d.setHours(minutes / 60, minutes % 60);
            return toCustomLocaleString(d);
          }} />
          <ValueAxis />

          {allKeys.map((key) => <LineSeries key={key} name={key} valueField="value" argumentField={key} />)}

          <ZoomAndPan />
        </Chart>
        : <CircularProgress />}
    </Box>
  );
}
