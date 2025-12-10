import { Extension } from '@tiptap/core';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import type { Node } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { TableView } from '@tiptap/pm/tables';
import { TableHandleExtension } from './TableHandler';

// 表格相关常量
const TABLE_CONSTANTS = {
  DEFAULT_CELL_MIN_WIDTH: 100,
  HANDLE_WIDTH: 5,
  SHORTCUT_KEY: 'Mod-9',
  DEFAULT_ROWS: 3,
  DEFAULT_COLS: 4,
} as const;

// 表格单元格的通用属性定义
const createCommonCellAttributes = (isHeader = false) => ({
  bgcolor: {
    default: null,
    parseHTML: (element: HTMLElement) => {
      return element.getAttribute('data-background-color') || element.style.backgroundColor;
    },
    renderHTML: (attributes: Record<string, any>) => {
      if (isHeader) {
        return {
          'data-background-color': attributes.bgcolor,
          style: `background-color: ${attributes.bgcolor}`,
        };
      } else {
        return {
          'data-background-color': attributes.bgcolor,
          style: `background-color: ${attributes.bgcolor}`,
        };
      }
    },
  },
  textAlign: {
    default: null,
    parseHTML: (element: HTMLElement) => {
      return element.getAttribute('data-text-align') || element.style.textAlign;
    },
    renderHTML: (attributes: Record<string, any>) => {
      if (!attributes.textAlign) return {};
      return {
        style: `text-align: ${attributes.textAlign}`,
        'data-text-align': attributes.textAlign,
      };
    },
  },
  verticalAlign: {
    default: null,
    parseHTML: (element: HTMLElement) => {
      return element.getAttribute('data-vertical-align') || element.style.verticalAlign;
    },
    renderHTML: (attributes: Record<string, any>) => {
      if (!attributes.verticalAlign) return {};
      return {
        style: `vertical-align: ${attributes.verticalAlign}`,
        'data-vertical-align': attributes.verticalAlign,
      };
    },
  },
  fontSize: {
    default: null,
    parseHTML: (element: HTMLElement) => {
      return element.getAttribute('data-font-size') || element.style.fontSize;
    },
    renderHTML: (attributes: Record<string, any>) => {
      if (!attributes.fontSize) return {};
      return {
        style: `font-size: ${attributes.fontSize}`,
        'data-font-size': attributes.fontSize,
      };
    },
  },
  fontWeight: {
    default: null,
    parseHTML: (element: HTMLElement) => {
      return element.getAttribute('data-font-weight') || element.style.fontWeight;
    },
    renderHTML: (attributes: Record<string, any>) => {
      if (!attributes.fontWeight) return {};
      return {
        style: `font-weight: ${attributes.fontWeight}`,
        'data-font-weight': attributes.fontWeight,
      };
    },
  },
});

export const TableExtension = ({ editable }: { editable: boolean }) => [
  Table.extend({
    addNodeView() {
      return ({ node, HTMLAttributes }) => {
        class TiptapTableView extends TableView {
          private readonly tableWrapper: HTMLDivElement;
          private readonly innerTableContainer: HTMLDivElement;
          private readonly widgetsContainer: HTMLDivElement;
          private readonly selectionOverlayContainer: HTMLDivElement;

          declare readonly node: Node;
          declare readonly minCellWidth: number;
          private readonly containerAttributes: Record<string, string>;

          constructor(
            node: Node,
            minCellWidth: number,
            containerAttributes: Record<string, string>
          ) {
            super(node, minCellWidth);

            this.containerAttributes = containerAttributes ?? {};

            this.tableWrapper = this.createTableWrapper();
            this.innerTableContainer = this.createInnerTableContainer();
            this.widgetsContainer = this.createWidgetsContainer();
            this.selectionOverlayContainer = this.createSelectionOverlayContainer();

            this.setupDOMStructure();
          }

          private createTableWrapper(): HTMLDivElement {
            const container = document.createElement('div');
            container.setAttribute("data-content-type", "table")
            this.applyContainerAttributes(container);
            return container;
          }

          private createInnerTableContainer(): HTMLDivElement {
            const container = document.createElement('div');
            container.className = 'table-container';
            return container;
          }

          private createWidgetsContainer(): HTMLDivElement {
            const container = document.createElement('div');
            container.className = 'table-controls';
            container.style.position = 'relative';
            return container;
          }

          private createSelectionOverlayContainer(): HTMLDivElement {
            const container = document.createElement('div');
            container.className = 'table-selection-overlay-container';
            container.style.position = 'relative';
            return container;
          }

          private applyContainerAttributes(element: HTMLDivElement): void {
            Object.entries(this.containerAttributes).forEach(([key, value]) => {
              if (key !== 'class') {
                element.setAttribute(key, value);
              }
            });
          }

          private setupDOMStructure(): void {
            const originalTable = this.dom
            const tableElement = originalTable.firstChild!
            this.innerTableContainer.appendChild(tableElement)
            originalTable.appendChild(this.innerTableContainer)
            originalTable.appendChild(this.widgetsContainer)
            originalTable.appendChild(this.selectionOverlayContainer)

            this.tableWrapper.appendChild(originalTable)

            this.dom = this.tableWrapper
          }

          ignoreMutation(mutation: any): boolean {
            const target = mutation.target as HTMLElement;
            const isInsideThisTable = this.innerTableContainer.contains(target);

            return !isInsideThisTable || super.ignoreMutation(mutation);
          }
        }

        const cellMinWidth =
          this.options.cellMinWidth < TABLE_CONSTANTS.DEFAULT_CELL_MIN_WIDTH
            ? TABLE_CONSTANTS.DEFAULT_CELL_MIN_WIDTH
            : this.options.cellMinWidth;
        return new TiptapTableView(node, cellMinWidth, HTMLAttributes);
      };
    },
    renderHTML({ node, HTMLAttributes }: {
      node: Node;
      HTMLAttributes: Record<string, any>;
    }) {
      const firstRow = node.content.firstChild;
      const colCount = firstRow ? firstRow.childCount : 0;

      // 构建表格样式
      const tableStyles = [
        `--default-cell-min-width: ${TABLE_CONSTANTS.DEFAULT_CELL_MIN_WIDTH}px`,
        `min-width: ${colCount * TABLE_CONSTANTS.DEFAULT_CELL_MIN_WIDTH}px`,
      ];

      // 合并现有样式
      const existingStyle = HTMLAttributes.style;
      const combinedStyle = existingStyle
        ? `${existingStyle}; ${tableStyles.join('; ')}`
        : tableStyles.join('; ');

      const attrs = {
        ...HTMLAttributes,
        style: combinedStyle,
      };

      // 生成列定义
      const cols: (string | Record<string, unknown>)[][] = [];
      for (let i = 0; i < colCount; i++) {
        cols.push(['col', {}]);
      }

      return ['table', attrs, ['colgroup', {}, ...cols], ['tbody', 0]];
    },
    addCommands() {
      return {
        ...this.parent?.(),
        cancelSelection: () => ({ state, dispatch }: any) => {
          if (dispatch) {
            const { selection } = state;
            const { $from } = selection;

            // 找到当前单元格的起始和结束位置
            let cellStart = $from.pos;
            let cellEnd = $from.pos;
            let depth = $from.depth;

            // 向上查找直到找到表格单元格
            while (depth > 0) {
              const node = $from.node(depth);
              if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
                cellStart = $from.start(depth);
                cellEnd = $from.end(depth);
                break;
              }
              depth--;
            }

            // 设置选区为单元格的最后位置（不选中文本）
            const newSelection = TextSelection.create(state.doc, cellEnd - 1);
            dispatch(state.tr.setSelection(newSelection));
          }

          return true;
        },
      }
    },
    addKeyboardShortcuts() {
      return {
        [TABLE_CONSTANTS.SHORTCUT_KEY]: () => this.editor.chain()
          .insertTable({
            rows: TABLE_CONSTANTS.DEFAULT_ROWS,
            cols: TABLE_CONSTANTS.DEFAULT_COLS,
            withHeaderRow: false
          })
          .focus()
          .run(),
      }
    },
  }).configure({
    handleWidth: TABLE_CONSTANTS.HANDLE_WIDTH,
    cellMinWidth: TABLE_CONSTANTS.DEFAULT_CELL_MIN_WIDTH,
    resizable: editable,
    lastColumnResizable: editable,
    allowTableNodeSelection: editable,
  }),
  TableHeader.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...createCommonCellAttributes(true),
      };
    },
  }).configure({
    HTMLAttributes: {
      class: 'table-header',
    },
  }),
  TableRow.configure({
    HTMLAttributes: {
      class: 'table-row',
    },
  }),
  TableCell.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...createCommonCellAttributes(false),
      };
    },
    addKeyboardShortcuts() {
      return {
        Tab: () => {
          if (this.editor.chain().goToNextCell().focus().run()) {
            return true;
          } else if (!this.editor.can().addRowAfter()) {
            return false;
          } else {
            return this.editor.chain().addRowAfter().goToNextCell().run();
          }
        },
        'Shift-Tab': () => this.editor.chain().goToPreviousCell().run(),
      };
    },
  }),
  editable ? TableHandleExtension : Extension.create({ name: 'tableHandleExtension' }),
]

export default TableExtension