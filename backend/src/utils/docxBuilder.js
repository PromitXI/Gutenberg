const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat
} = require('docx');

class DocxBuilder {
  constructor(projectDetails, platform, documentType) {
    this.projectDetails = projectDetails;
    this.platform = platform;
    this.documentType = documentType;
    this.sections = [];
  }

  getDocumentConfig() {
    return {
      styles: {
        default: {
          document: {
            run: { font: "Arial", size: 24 }
          }
        },
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: { size: 36, bold: true, font: "Arial", color: "1F4E79" },
            paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 }
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
            paragraph: { spacing: { before: 280, after: 180 }, outlineLevel: 1 }
          },
          {
            id: "Heading3",
            name: "Heading 3",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: { size: 24, bold: true, font: "Arial", color: "404040" },
            paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 }
          }
        ]
      },
      numbering: {
        config: [
          {
            reference: "bullets",
            levels: [{
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } }
            },
            {
              level: 1,
              format: LevelFormat.BULLET,
              text: "\u25E6",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } }
            }]
          },
          {
            reference: "numbers",
            levels: [{
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } }
            },
            {
              level: 1,
              format: LevelFormat.DECIMAL,
              text: "%1.%2.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } }
            }]
          }
        ]
      }
    };
  }

  createTable(headers, rows, columnWidths) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
    const borders = { top: border, bottom: border, left: border, right: border };

    const headerRow = new TableRow({
      tableHeader: true,
      children: headers.map((header, i) => new TableCell({
        borders,
        width: { size: columnWidths[i], type: WidthType.DXA },
        shading: { fill: "1F4E79", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({
            text: header,
            bold: true,
            color: "FFFFFF",
            font: "Arial",
            size: 20
          })]
        })]
      }))
    });

    const dataRows = rows.map((row, rowIndex) => new TableRow({
      children: row.map((cell, i) => new TableCell({
        borders,
        width: { size: columnWidths[i], type: WidthType.DXA },
        shading: rowIndex % 2 === 1 ? { fill: "F2F7FB", type: ShadingType.CLEAR } : undefined,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text: String(cell), font: "Arial", size: 20 })]
        })]
      }))
    }));

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: columnWidths,
      rows: [headerRow, ...dataRows]
    });
  }

  createInfoBox(title, content) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: "2E75B6" };
    const borders = { top: border, bottom: border, left: border, right: border };

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [9360],
      rows: [
        new TableRow({
          children: [new TableCell({
            borders,
            shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 150, right: 150 },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [new TextRun({
                  text: String(title || ''),
                  bold: true,
                  font: "Arial",
                  size: 20,
                  color: "1F4E79"
                })]
              }),
              new Paragraph({
                children: [new TextRun({
                  text: String(content || ''),
                  font: "Arial",
                  size: 20,
                  italics: true,
                  color: "333333"
                })]
              })
            ]
          })]
        })
      ]
    });
  }

  createBullet(text, level = 0) {
    return new Paragraph({
      numbering: { reference: "bullets", level },
      children: [new TextRun({ text: String(text || ''), font: "Arial", size: 22 })],
      spacing: { after: 60 }
    });
  }

  createNumberedItem(text, level = 0) {
    return new Paragraph({
      numbering: { reference: "numbers", level },
      children: [new TextRun({ text: String(text || ''), font: "Arial", size: 22 })],
      spacing: { after: 60 }
    });
  }

  createPara(text, options = {}) {
    const runs = [];
    if (options.label) {
      runs.push(new TextRun({
        text: String(options.label || ''),
        font: "Arial",
        size: options.size || 22,
        bold: true,
        color: options.labelColor || "1F4E79"
      }));
    }
    runs.push(new TextRun({
      text: String(text || ''),
      font: "Arial",
      size: options.size || 22,
      bold: options.bold || false,
      italics: options.italics || false,
      color: options.color || "000000"
    }));

    return new Paragraph({
      alignment: options.alignment || AlignmentType.LEFT,
      children: runs,
      spacing: { after: options.spaceAfter || 120, before: options.spaceBefore || 0 }
    });
  }

  createPageBreak() {
    return new Paragraph({ children: [new PageBreak()] });
  }

  createHeading(text, level) {
    return new Paragraph({
      heading: level,
      children: [new TextRun({ text: String(text || ''), font: "Arial" })]
    });
  }

  createTitlePage(data) {
    const docTypeLabel = this.documentType === 'hld' ? 'High-Level Design' : 'Low-Level Design';
    const docTypeAbbr = this.documentType.toUpperCase();
    const platformLabel = this.platform === 'aws' ? 'Amazon Web Services (AWS)' : 'Microsoft Azure';
    const accentColor = this.platform === 'aws' ? 'FF9900' : '0078D4';
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return [
      new Paragraph({ spacing: { before: 2400 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({
          text: platformLabel,
          font: "Arial",
          size: 28,
          color: accentColor,
          bold: true
        })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({
          text: "\u2500".repeat(40),
          font: "Arial",
          size: 20,
          color: "CCCCCC"
        })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({
          text: data.projectName || this.projectDetails.projectName,
          font: "Arial",
          size: 48,
          bold: true,
          color: "1F4E79"
        })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({
          text: `${docTypeLabel} (${docTypeAbbr}) Document`,
          font: "Arial",
          size: 32,
          color: "2E75B6"
        })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({
          text: "\u2500".repeat(40),
          font: "Arial",
          size: 20,
          color: "CCCCCC"
        })]
      }),
      new Paragraph({ spacing: { after: 600 }, children: [] }),
      this.createTable(
        ['Field', 'Details'],
        [
          ['Document Title', `${data.projectName || this.projectDetails.projectName} - ${docTypeAbbr}`],
          ['Client', data.clientName || this.projectDetails.clientName],
          ['Author', this.projectDetails.authorName],
          ['Version', this.projectDetails.version || '1.0'],
          ['Date', today],
          ['Classification', 'Confidential'],
          ['Platform', platformLabel],
          ['Region', this.projectDetails.region || 'N/A']
        ],
        [3000, 6360]
      )
    ];
  }

  async build(content) {
    const config = this.getDocumentConfig();
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const doc = new Document({
      ...config,
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({
                text: `${this.projectDetails.projectName} ${this.documentType.toUpperCase()} - Confidential`,
                italics: true,
                size: 18,
                color: "666666",
                font: "Arial"
              })]
            })]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${this.projectDetails.clientName} | ${today} | `, size: 16, color: "999999", font: "Arial" }),
                  new TextRun({ text: "Page ", size: 16, color: "999999", font: "Arial" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999", font: "Arial" }),
                  new TextRun({ text: " of ", size: 16, color: "999999", font: "Arial" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "999999", font: "Arial" })
                ]
              })
            ]
          })
        },
        children: content
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

module.exports = DocxBuilder;
