export type PhotoSampleKey='concrete'|'stone'|'yellow'|'membrane'|'red'|'redExterior'|'blue';
export type PhotoSample={file:string;quad:[number,number][];meanRGB:number[];color:string;size:[number,number];roughness:number;contrast:number;relief:number;sourceSample:string};
export const photoSamples:{imageSizes:Record<string,[number,number]>;samples:Record<PhotoSampleKey,PhotoSample>}={
  "imageSizes": {
    "13-usach-fae-pca-7-ok.jpg": [
      2000,
      1921
    ],
    "02-usach-fae-pca-11-ok.jpg": [
      2000,
      3240
    ],
    "03-usach-fae-pca-14-ok.jpg": [
      2000,
      2572
    ]
  },
  "samples": {
    "concrete": {
      "file": "02-usach-fae-pca-11-ok.jpg",
      "quad": [
        [
          0.762058,
          0.553075
        ],
        [
          0.850482,
          0.554563
        ],
        [
          0.850482,
          0.628968
        ],
        [
          0.762058,
          0.62748
        ]
      ],
      "meanRGB": [
        175.814,
        175.748,
        178.157
      ],
      "color": "#aeb0ab",
      "size": [
        1.05,
        1.45
      ],
      "roughness": 0.79,
      "contrast": 0.8,
      "relief": 0.004,
      "sourceSample": "C02"
    },
    "stone": {
      "file": "13-usach-fae-pca-7-ok.jpg",
      "quad": [
        [
          0.186887,
          0.901723
        ],
        [
          0.390931,
          0.901723
        ],
        [
          0.404412,
          0.922782
        ],
        [
          0.180147,
          0.922782
        ]
      ],
      "meanRGB": [
        127.546,
        120.274,
        113.362
      ],
      "color": "#beb7a6",
      "size": [
        0.6,
        0.9
      ],
      "roughness": 0.72,
      "contrast": 0.55,
      "relief": 0.002,
      "sourceSample": "P01"
    },
    "yellow": {
      "file": "03-usach-fae-pca-14-ok.jpg",
      "quad": [
        [
          0.346016,
          0.714844
        ],
        [
          0.515434,
          0.688058
        ],
        [
          0.515434,
          0.861607
        ],
        [
          0.346016,
          0.876674
        ]
      ],
      "meanRGB": [
        161.436,
        134.876,
        22.757
      ],
      "color": "#e9c900",
      "size": [
        1.1,
        1.1
      ],
      "roughness": 0.22,
      "contrast": 0.24,
      "relief": 0,
      "sourceSample": "Y01"
    },
    "membrane": {
      "file": "03-usach-fae-pca-14-ok.jpg",
      "quad": [
        [
          0.150754,
          0.039063
        ],
        [
          0.396267,
          0.039063
        ],
        [
          0.405599,
          0.334821
        ],
        [
          0.159368,
          0.329241
        ]
      ],
      "meanRGB": [
        222.94,
        214.403,
        205.071
      ],
      "color": "#f2f1e9",
      "size": [
        3.6,
        3.6
      ],
      "roughness": 0.83,
      "contrast": 0.2,
      "relief": 0,
      "sourceSample": "M01"
    },
    "red": {
      "file": "13-usach-fae-pca-7-ok.jpg",
      "quad": [
        [
          0.226716,
          0.382259
        ],
        [
          0.303309,
          0.370772
        ],
        [
          0.310662,
          0.393108
        ],
        [
          0.226716,
          0.424378
        ]
      ],
      "meanRGB": [
        157.802,
        93.689,
        94.368
      ],
      "color": "#cd2439",
      "size": [
        1.5,
        0.7
      ],
      "roughness": 0.26,
      "contrast": 0.23,
      "relief": 0,
      "sourceSample": "R02"
    },
    "redExterior": {
      "file": "13-usach-fae-pca-7-ok.jpg",
      "quad": [
        [
          0.226716,
          0.382259
        ],
        [
          0.303309,
          0.370772
        ],
        [
          0.310662,
          0.393108
        ],
        [
          0.226716,
          0.424378
        ]
      ],
      "meanRGB": [
        157.802,
        93.689,
        94.368
      ],
      "color": "#ce3946",
      "size": [
        1.1,
        1.1
      ],
      "roughness": 0.23,
      "contrast": 0.17,
      "relief": 0,
      "sourceSample": "R02"
    },
    "blue": {
      "file": "13-usach-fae-pca-7-ok.jpg",
      "quad": [
        [
          0.166054,
          0.190172
        ],
        [
          0.174632,
          0.184429
        ],
        [
          0.210172,
          0.268028
        ],
        [
          0.20098,
          0.27441
        ]
      ],
      "meanRGB": [
        95.916,
        131.207,
        178.676
      ],
      "color": "#1f87ba",
      "size": [
        0.7,
        1.5
      ],
      "roughness": 0.26,
      "contrast": 0.18,
      "relief": 0,
      "sourceSample": "B01"
    }
  }
};
