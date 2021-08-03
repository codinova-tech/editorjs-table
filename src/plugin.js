const { TableConstructor } = require("./tableConstructor");
const toolboxIcon = require("./img/toolboxIcon.svg");
const insertColBefore = require("./img/insertColBeforeIcon.svg");
const insertColAfter = require("./img/indertColAfterIcon.svg");
const insertRowBefore = require("./img/insertRowBeforeIcon.svg");
const insertRowAfter = require("./img/insertRowAfter.svg");
const deleteRow = require("./img/deleteRowIcon.svg");
const deleteCol = require("./img/deleteColIcon.svg");

const Icons = {
  Toolbox: toolboxIcon,
  InsertColBefore: insertColBefore,
  InsertColAfter: insertColAfter,
  InsertRowBefore: insertRowBefore,
  InsertRowAfter: insertRowAfter,
  DeleteRow: deleteRow,
  DeleteCol: deleteCol,
};

const CSS = {
  input: "tc-table__inp",
};

/**
 *  Tool for table's creating
 *  @typedef {object} TableData - object with the data transferred to form a table
 *  @property {string[][]} content - two-dimensional array which contains table content
 */
class Table {
  /**
   * Allow to press Enter inside the CodeTool textarea
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }
  
  /**
   * Notify core that read-only mode is supported
   * @returns {boolean}
   */
  static get isReadOnlySupported () {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @return {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: Icons.Toolbox,
      title: "Table",
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   * @param {TableData} data — previously saved data
   * @param {object} config - user config for Tool
   * @param {object} api - Editor.js API
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.wrapper = undefined;
    this.config = config;
    this.data = data;
    this.readOnly = readOnly;
    this._tableConstructor = new TableConstructor({ data, config, api, readOnly });

    this.actions = [
      {
        actionName: "InsertColBefore",
        icon: Icons.InsertColBefore,
        label: "Insert column before",
      },
      {
        actionName: "InsertColAfter",
        icon: Icons.InsertColAfter,
        label: "Insert column after",
      },
      {
        actionName: "InsertRowBefore",
        icon: Icons.InsertRowBefore,
        label: "Insert row before",
      },
      {
        actionName: "InsertRowAfter",
        icon: Icons.InsertRowAfter,
        label: "Insert row after",
      },
      {
        actionName: "DeleteRow",
        icon: Icons.DeleteRow,
        label: "Delete row",
      },
      {
        actionName: "DeleteCol",
        icon: Icons.DeleteCol,
        label: "Delete column",
      },
    ];
  }

  /**
   * perform selected action
   * @param actionName {string} - action name
   * @return {undefined}
   */
  performAction(actionName) {
    switch (actionName) {
      case "InsertColBefore":
        this._tableConstructor.table.insertColumnBefore();
        break;
      case "InsertColAfter":
        this._tableConstructor.table.insertColumnAfter();
        break;
      case "InsertRowBefore":
        this._tableConstructor.table.insertRowBefore();
        break;
      case "InsertRowAfter":
        this._tableConstructor.table.insertRowAfter();
        break;
      case "DeleteRow":
        this._tableConstructor.table.deleteRow();
        break;
      case "DeleteCol":
        this._tableConstructor.table.deleteColumn();
        break;
    }
  }

  /**
   * render actions toolbar
   * @returns {HTMLDivElement}
   */
  renderSettings() {
    const wrapper = document.createElement("div");

    this.actions.forEach(({ actionName, label, icon }) => {
      const title = this.api.i18n.t(label);
      const button = document.createElement("div");

      button.classList.add("cdx-settings-button");
      button.innerHTML = icon;
      button.title = actionName;

      this.api.tooltip.onHover(button, title, {
        placement: "top",
      });
      button.addEventListener(
        "click",
        this.performAction.bind(this, actionName)
      );
      wrapper.appendChild(button);
      if(this._tableConstructor.table.selectedCell) {
        this._tableConstructor.table.focusCellOnSelectedCell();
      }
    });
    return wrapper;
  }

  /**
   * Return Tool's view
   * @returns {HTMLDivElement}
   * @public
   */
  render() {
    this.wrapper = document.createElement("div");

    if ((this.data && this.data.content)) {
      //Creates table if Data is Present
      this._createTableConfiguration();
    } else  {
      // Create table preview if New table is initialised
      this.wrapper.classList.add("table-selector");
      this.wrapper.setAttribute("data-hoveredClass", "m,n");
      const rows = 6;
      this.createCells(rows);
      //Hover to select cells
      if (this.wrapper.className === "table-selector") {
        this.wrapper.addEventListener("mouseover", (event) => {
          const selectedCell = event.target.id;
          if (selectedCell.length) {
            const selectedRow = event.target.attributes.row.value;
            const selectedColumn = event.target.attributes.column.value;
            this.wrapper.setAttribute(
              "data-hoveredClass",
              `${selectedRow},${selectedColumn}`
            );
          }
        });
      }
      //set the select cell to load table config
      this.wrapper.addEventListener("click", (event) => {
        const selectedCell = event.target.id;
        if (selectedCell.length) {
          const selectedRow = event.target.attributes.row.value;
          const selectedColumn = event.target.attributes.column.value;
          this.wrapper.removeEventListener("mouseover", () => {});
          this.config.rows = selectedRow;
          this.config.cols = selectedColumn;
          this._createTableConfiguration();
        }
      });
    }
    return this.wrapper;
  }
  
  createCells(rows) {
    if (rows !== 0) {
      for (let i = 0; i < rows; i++) {
        let rowDiv = document.createElement("div");
        rowDiv.setAttribute("class", "table-row");
        for (let j = 0; j < rows; j++) {
          let columnDivContainer = document.createElement("div");
          let columnDiv = document.createElement("div");
          columnDivContainer.setAttribute("class", "table-cell-container");
          columnDiv.setAttribute("class", "table-cell");
          columnDivContainer.setAttribute("id", `row_${i + 1}_cell_${j + 1}`);
          columnDivContainer.setAttribute("column", j + 1);
          columnDivContainer.setAttribute("row", i + 1);
          columnDiv.setAttribute("id", `cell_${j + 1}`);
          columnDiv.setAttribute("column", j + 1);
          columnDiv.setAttribute("row", i + 1);
          columnDivContainer.appendChild(columnDiv);
          rowDiv.appendChild(columnDivContainer);
        }
        this.wrapper.appendChild(rowDiv);
      }
    }
    const hiddenEl = document.createElement('input');
    hiddenEl.classList.add('hidden-element');
    hiddenEl.setAttribute('tabindex', 0);
    this.wrapper.appendChild(hiddenEl);
  }

  _createTableConfiguration() {
    this.wrapper.innerHTML = "";
    this._tableConstructor = new TableConstructor({
      data: this.data,
      config: this.config,
      api: this.api,
      readOnly: this.readOnly,
    });
    this.wrapper.appendChild(this._tableConstructor.htmlElement);
  }
  /**
   * Extract Tool's data from the view
   * @returns {TableData} - saved data
   * @public
   */
  save(toolsContent) {
    const table = toolsContent.querySelector("table");
    const data = [];
    const rows = table ? table.rows : 0;
    if(rows.length) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cols = Array.from(row.cells);
        const inputs = cols.map((cell) => cell.querySelector("." + CSS.input));
        const isWorthless = inputs.every(this._isEmpty);

        if (isWorthless) {
          continue;
        }
        data.push(inputs.map((input) => input.innerHTML));
    }
    return {
      content: data,
    };
  }
}

  /**
   * @private
   *
   * Check input field is empty
   * @param {HTMLElement} input - input field
   * @return {boolean}
   */
  _isEmpty(input) {
    return !input.textContent.trim();
  }

  static get pasteConfig() {
    return {
      tags: ['TABLE', 'TR', 'TD', 'TBODY', 'TH'],
    };
  }

  async onPaste(event) {
    const table = event.detail.data;
    this.data  = this.pasteHandler(table);
    this._createTableConfiguration();
  }
  
  pasteHandler(element) {
    const {tagName: tag} = element;
    const data = {
      content: [],
      config: {
        rows: 0,
        cols: 0
      }
    }
    if(tag ==='TABLE') {
      let tableBody = Array.from(element.childNodes);
      tableBody = tableBody.find(el => el.nodeName === 'TBODY');
      let tableRows = Array.from(tableBody.childNodes);
      tableRows = [tableRows].map(obj => {
        return obj.filter((tr) => tr.nodeName === 'TR');
      });
      data.config.rows = tableRows[0].length;
      data.content = tableRows[0].map((tr) => {
        let tableData = tr.childNodes;
        data.config.cols = tableData.length;
        tableData = [...tableData].map((td) => {
          return td.innerHTML;
        });
        return tableData;
      })
    }
    return data;
  }
}

module.exports = Table;
