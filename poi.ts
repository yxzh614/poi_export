import https from "https";
import crypto from "crypto";

import config from "./config.json";

/** 睡眠0.3秒，接口QPS < 5 */
const sleep = () =>
  new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, 300);
  });

/** 腾讯地图应用SK */
const SK = config.application.SK;
/** 腾讯地图应用KEY */
const KEY = config.application.KEY;

/** http get请求 */
const get = (uri, callback) => {
  https.get(encodeURI(uri), (res) => {
    res.setEncoding("utf8");
    let rawData = "";
    res.on("data", (chunk) => {
      rawData += chunk;
    });
    res.on("end", () => {
      try {
        const parsedData = JSON.parse(rawData);
        callback && callback(parsedData);
      } catch (e) {
        console.error(e.message);
      }
    });
  });
};

export interface PoiData {
  id: string;
  /** 店名 */
  title: string;
  /** 地址 */
  address: string;
  /** 电话 */
  tel: string;
  /** 分类 */
  category: string;
  type: 0;
  location: {
    lat: 41.79978;
    lng: 123.339658;
  };
  ad_info: {
    adcode: number;
    province: string;
    city: string;
    district: string;
  };
}

export const getPoiProm = (
  keyword: string,
  city: string,
  filter: string,
  page = 1
) =>
  new Promise<{
    count: number;
    data: PoiData[];
  }>((res) => {
    const req = `/ws/place/v1/search?boundary=region(${city},2)&filter=${filter}&key=${KEY}&keyword=${keyword}&page_index=${page}&page_size=20`;
    const sig = crypto
      .createHash("md5")
      .update(req + SK)
      .digest("hex");
    get(`https://apis.map.qq.com${req}&sig=${sig}`, (data) => {
      res(data);
    });
  });

export const getCities = () =>
  new Promise<{
    count: number;
    data: PoiData[];
  }>((res) => {
    const req = `/ws/district/v1/list?key=${KEY}`;
    const sig = crypto
      .createHash("md5")
      .update(req + SK)
      .digest("hex");
    get(`https://apis.map.qq.com${req}&sig=${sig}`, (data) => {
      res(data);
    });
  });

export const getAll = async (config: {
  keyword: string;
  address: string;
  filter: string;
  onProgress: (data: { page: number; data: PoiData[] }) => void;
  stopAtRepeat: boolean;
}): Promise<PoiData[]> => {
  const { keyword, address, filter, onProgress, stopAtRepeat } = config;
  let finish = false;
  let result: PoiData[] = [];
  let index = 1;
  let maxCount = 0;
  do {
    console.log(`【请求第${index}页】`);
    const res = await getPoiProm(keyword, address, filter, index);

    await sleep();
    if (res?.data?.length) {
      maxCount = res.count;
      console.log(`【返回数量：${res?.data?.length}, 当前已请求：${result.length}，预计总数：${res.count}】`);
      if (
        stopAtRepeat &&
        result.some((x) => {
          return x.id === res.data[0].id;
        })
      ) {
        // 重复数据
        console.log(`发现重复数据：${res.data[0].address}，停止继续查询`);
        finish = true;
        continue;
      }
      onProgress({
        page: index,
        data: res.data,
      });
      result = [...result, ...res.data];
      index++;
    } else {
      if (!result.length) {
        console.log(address, res);
      }
      finish = true;
    }
  } while (!finish && result.length < maxCount);
  console.log(`【获取完毕，总计：${result.length}】`);

  return result;
};
