export const DATASET = [
  {
    id: "ORD-001",
    fileName: "多页彩盒订单.pdf",
    format: "PDF",
    pages: 4,
    scenario: "多页订单 / 分页聚合",
    sourceExcerpt: "星河包装；彩盒 A；物料 M-2401；数量 12,000；210×148mm；350g 白卡；交期 2026-11-02；覆哑膜。",
    groundTruth: {
      customerName: "星河包装",
      productName: "彩盒A",
      materialCode: "M-2401",
      quantity: 12000,
      productSize: "210×148mm",
      paperType: "350g白卡",
      deliveryDate: "2026-11-02",
      specialProcess: "覆哑膜"
    },
    predictions: {
      v1: {
        latencyMs: 4860,
        repeatConsistency: 82,
        values: {
          customerName: "星河包装",
          productName: "彩盒A",
          materialCode: null,
          quantity: 1200,
          productSize: null,
          paperType: null,
          deliveryDate: "2026-11-02",
          specialProcess: "覆哑膜"
        }
      },
      v2: {
        latencyMs: 5120,
        repeatConsistency: 98,
        values: {
          customerName: "星河包装",
          productName: "彩盒A",
          materialCode: "M-2401",
          quantity: 12000,
          productSize: "210×148mm",
          paperType: "350g白卡",
          deliveryDate: "2026-11-02",
          specialProcess: "覆哑膜"
        }
      }
    }
  },
  {
    id: "ORD-002",
    fileName: "低清扫描订单.jpg",
    format: "JPG",
    pages: 1,
    scenario: "低清扫描 / 字符混淆",
    sourceExcerpt: "远帆印务；说明书；物料 P-8802；5,000 本；145×210mm；80g 双胶纸；交期 2026/11/06。",
    groundTruth: {
      customerName: "远帆印务",
      productName: "说明书",
      materialCode: "P-8802",
      quantity: 5000,
      productSize: "145×210mm",
      paperType: "80g双胶纸",
      deliveryDate: "2026-11-06",
      specialProcess: null
    },
    predictions: {
      v1: {
        latencyMs: 6250,
        repeatConsistency: 76,
        values: {
          customerName: "远帆印务",
          productName: "说明书",
          materialCode: "P-88O2",
          quantity: 5000,
          productSize: "145×210mm",
          paperType: "80g灰板纸",
          deliveryDate: "2026-11-06",
          specialProcess: "烫金"
        }
      },
      v2: {
        latencyMs: 6480,
        repeatConsistency: 96,
        values: {
          customerName: "远帆印务",
          productName: "说明书",
          materialCode: "P-8802",
          quantity: 5000,
          productSize: "145×210mm",
          paperType: "80g双胶纸",
          deliveryDate: "2026-11-06",
          specialProcess: null
        }
      }
    }
  },
  {
    id: "ORD-003",
    fileName: "批量标签订单.xlsx",
    format: "XLSX",
    pages: 2,
    scenario: "表格订单 / 日期标准化",
    sourceExcerpt: "云岭科技；设备标签；物料 L-1090；数量 36,000；60×30mm；铜版不干胶；2026年11月18日；打孔。",
    groundTruth: {
      customerName: "云岭科技",
      productName: "设备标签",
      materialCode: "L-1090",
      quantity: 36000,
      productSize: "60×30mm",
      paperType: "铜版不干胶",
      deliveryDate: "2026-11-18",
      specialProcess: "打孔"
    },
    predictions: {
      v1: {
        latencyMs: 3720,
        repeatConsistency: 90,
        values: {
          customerName: "云岭科技",
          productName: "设备标签",
          materialCode: "L-1090",
          quantity: "36,000",
          productSize: "60×30mm",
          paperType: "铜版不干胶",
          deliveryDate: "2026-11-08",
          specialProcess: "打孔"
        }
      },
      v2: {
        latencyMs: 3880,
        repeatConsistency: 100,
        values: {
          customerName: "云岭科技",
          productName: "设备标签",
          materialCode: "L-1090",
          quantity: "36,000",
          productSize: "60×30mm",
          paperType: "铜版不干胶",
          deliveryDate: "2026-11-18",
          specialProcess: "打孔"
        }
      }
    }
  },
  {
    id: "ORD-004",
    fileName: "常规纸箱订单.docx",
    format: "DOCX",
    pages: 2,
    scenario: "Word 转换 / 基线样本",
    sourceExcerpt: "启明食品；运输纸箱；物料 C-3108；8,000 个；420×310×260mm；五层瓦楞；2026-11-12。",
    groundTruth: {
      customerName: "启明食品",
      productName: "运输纸箱",
      materialCode: "C-3108",
      quantity: 8000,
      productSize: "420×310×260mm",
      paperType: "五层瓦楞",
      deliveryDate: "2026-11-12",
      specialProcess: null
    },
    predictions: {
      v1: {
        latencyMs: 4180,
        repeatConsistency: 96,
        values: {
          customerName: "启明食品",
          productName: "运输纸箱",
          materialCode: "C-3108",
          quantity: 8000,
          productSize: "420×310×260mm",
          paperType: "五层瓦楞",
          deliveryDate: "2026-11-12",
          specialProcess: null
        }
      },
      v2: {
        latencyMs: 4290,
        repeatConsistency: 100,
        values: {
          customerName: "启明食品",
          productName: "运输纸箱",
          materialCode: "C-3108",
          quantity: 8000,
          productSize: "420×310×260mm",
          paperType: "五层瓦楞",
          deliveryDate: "2026-11-12",
          specialProcess: null
        }
      }
    }
  },
  {
    id: "ORD-005",
    fileName: "复杂工艺包装.png",
    format: "PNG",
    pages: 1,
    scenario: "图片订单 / 复杂工艺",
    sourceExcerpt: "北辰日化；礼盒 B；物料 G-7721；2,400 套；280×190×75mm；特种纸；2026-11-22；局部 UV。",
    groundTruth: {
      customerName: "北辰日化",
      productName: "礼盒B",
      materialCode: "G-7721",
      quantity: 2400,
      productSize: "280×190×75mm",
      paperType: "特种纸",
      deliveryDate: "2026-11-22",
      specialProcess: "局部UV"
    },
    predictions: {
      v1: {
        latencyMs: 7010,
        repeatConsistency: 72,
        values: {
          customerName: "北辰日化",
          productName: "礼盒8",
          materialCode: "G-7721",
          quantity: null,
          productSize: "280×190×75mm",
          paperType: "特种纸",
          deliveryDate: "2026-11-22",
          specialProcess: null
        }
      },
      v2: {
        latencyMs: 7350,
        repeatConsistency: 92,
        values: {
          customerName: "北辰日化",
          productName: "礼盒B",
          materialCode: "G-7721",
          quantity: 2400,
          productSize: "280×190×75mm",
          paperType: null,
          deliveryDate: "2026-11-22",
          specialProcess: "局部UV"
        }
      }
    }
  },
  {
    id: "ORD-006",
    fileName: "历史缺陷复测.pdf",
    format: "PDF",
    pages: 6,
    scenario: "历史缺陷 / 后半页明细",
    sourceExcerpt: "青禾文创；精装画册；物料 B-6610；1,500 本；210×285mm；157g 铜版纸；2026-11-28。",
    groundTruth: {
      customerName: "青禾文创",
      productName: "精装画册",
      materialCode: "B-6610",
      quantity: 1500,
      productSize: "210×285mm",
      paperType: "157g铜版纸",
      deliveryDate: "2026-11-28",
      specialProcess: null
    },
    predictions: {
      v1: {
        latencyMs: 8420,
        repeatConsistency: 68,
        values: {
          customerName: "青禾文创",
          productName: null,
          materialCode: null,
          quantity: 1500,
          productSize: null,
          paperType: "157g铜版纸",
          deliveryDate: "2026-11-28",
          specialProcess: null
        }
      },
      v2: {
        latencyMs: 8790,
        repeatConsistency: 94,
        values: {
          customerName: "青禾文创",
          productName: "精装画册",
          materialCode: "B-6601",
          quantity: 1500,
          productSize: "210×285mm",
          paperType: "157g铜版纸",
          deliveryDate: "2026-11-28",
          specialProcess: null
        }
      }
    }
  }
];
