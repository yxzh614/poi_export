import ExcelJS, { Worksheet } from "exceljs";
import { getAll, PoiData } from "./poi";
import config from "./config.json";

/** 创建工作表 */
const creatSheet = (
  workbookWritter: ExcelJS.stream.xlsx.WorkbookWriter,
  sheetName: string
) => {
  const newSheet = workbookWritter.addWorksheet(sheetName, {
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      paperSize: 9,
      fitToHeight: 0,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.3,
        bottom: 0.3,
        header: 0,
        footer: 0,
      },
    },
  });

  newSheet.columns = [
    { header: "店名", key: "title", width: 45 },
    { header: "电话", key: "tel", width: 35 },
    { header: "分类", key: "category", width: 20 },
    { header: "地区", key: "adInfo", width: 25 },
  ];

  newSheet.headerFooter.oddFooter = sheetName + " - 第 &P 页，共 &N 页";

  return newSheet;
};

/** 工作表加一行 */
const addRow = (sheet: Worksheet, data: any) => {
  const row = sheet.addRow(data);

  row.border = {
    bottom: { style: "thin" },
  };
  row.alignment = {
    wrapText: true,
  };
  row.commit();
};

/** 将poi信息加入工作表 */
const addPois = (sheet: Worksheet, data: PoiData[]) => {
  data.forEach((item) => {
    const { title, tel, category, ad_info } = item;
    console.log(`记录店铺：${title}`);
    addRow(sheet, [
      title,
      tel,
      category,
      `${ad_info.province}-${ad_info.city}-${ad_info.district}`,
    ]);
  });
};

const keyword = "婚纱";
const filter = "category<>摄影冲印,花鸟鱼虫";

const getAllByRegions = async (fileName: string, regions: string[]) => {
  const newWorkBook = new ExcelJS.stream.xlsx.WorkbookWriter({
    filename: `./output/${fileName}.xlsx`,
    useStyles: true,
  });
  let index = 0;
  while (regions[index]) {
    const newSheet = creatSheet(newWorkBook, regions[index]);
    await getAll({
      keyword,
      address: regions[index],
      filter,
      onProgress: ({ data }) => {
        addPois(newSheet, data);
      },
      stopAtRepeat: config.stop_at_repeat || false,
    });
    newSheet.commit();
    index++;
  }
  await newWorkBook.commit();
  console.log("write finish");
};

try {
  // 如果觉得config太麻烦，可以直接用regions存excel里的字符串，多复制几行
  // const regions = ``
  // const list = regions
  //   .trim()
  //   .split("\n")
  //   .map((x) => x.trim().slice(3).replace(/,/g, ""));
  // console.log(list);
  // const fileName = regions
  //   .trim()
  //   .split("\n")[0]
  //   .split(",")
  //   .slice(1, 3)
  //   .join("");
  // console.log(fileName);
  // getAllByRegions(fileName, list);

  const regions = config.regions;
  getAllByRegions(config.file_name, regions);
} catch (e) {
  console.error(e);
}
