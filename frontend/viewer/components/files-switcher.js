app.component("files-switcher", {
  emits: ["current-file"],

  data() {
    return {
      filesArray: [],
      names: [],
      fileId: 0,
      nbFiles: 0,
    };
  },
  mounted() {
    this.getData();
  },

  /*html*/
  template: `
         <div>
            <input class="button switch" id="myfiles" type="file" accept=".html" @change="uploadFile">
            <br/>
            <br/>
            <br/>
            <div v-for="(n, i) in nbFiles">
                <button v-if="fileId == i" class="button-bar-selected" @click="onAction(i)"> {{names[i]}} </button>
                <button v-else class="button-bar" @click="onAction(i)"> {{names[i]}} </button>
            </div>
            <br>
            <br/>
            <br/>
            <br/>
        </div>
                `,
  methods: {
    async uploadFile() {
      file = document.getElementById("myfiles").files[0];
      if (file) {
        console.log(file.name);
        for (const i of this.names) {
          if (file.name == i) return;
        }
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
          document.getElementById("content").innerHTML = evt.target.result;
        };
        setTimeout(() => {
          this.filesArray.push(document.getElementById("content").innerHTML);
          this.names.push(file.name);
          this.fileId = this.nbFiles;
          this.sendToServer(document.getElementById("content").innerHTML);
          this.$emit("current-file", this.fileId);
          this.nbFiles++;
        }, 100);

        reader.onerror = function (evt) {
          document.getElementById("content").innerHTML = "error reading file";
        };
      }
    },

    onAction(index) {
      console.log(this.names);
      document.getElementById("content").innerHTML = this.filesArray[index];
      this.fileId = index;
      this.$emit("current-file", index);
      console.log("current file : " + this.fileId);
      console.log("number of files : " + this.nbFiles);
    },

    async sendToServer() {
      let fileObj = {
        file: this.toJSON(document.getElementById("content")),
        fileName: this.names[this.fileId],
        index: this.fileId,
      };
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fileObj),
      };

      fetch("/files", options);
    },

    async getData() {
      const rf = await fetch("/files");
      const filesData = await rf.json();
      if (filesData.length != 0) {
        console.log(filesData);
        filesData.sort((a, b) => parseFloat(a.index) - parseFloat(b.index));
        console.log(filesData);
        for (let index = 0; index < filesData.length; index++) {
          document.getElementById("content").innerHTML = this.toDOM(
            filesData[index].file
          ).innerHTML;
          setTimeout(() => {
            this.filesArray.push(this.toDOM(filesData[index].file).innerHTML);
            this.names.push(filesData[index].fileName);
            this.fileId = this.nbFiles;
            this.$emit("current-file", this.fileId);
            this.nbFiles++;
          }, 100);
        }
        console.log(this.names);
      }
    },

    toJSON(node) {
      let propFix = { for: "htmlFor", class: "className" };
      let specialGetters = {
        style: (node) => node.style.cssText,
      };
      let attrDefaultValues = { style: "" };
      let obj = {
        nodeType: node.nodeType,
      };
      if (node.tagName) {
        obj.tagName = node.tagName.toLowerCase();
      } else if (node.nodeName) {
        obj.nodeName = node.nodeName;
      }
      if (node.nodeValue) {
        obj.nodeValue = node.nodeValue;
      }
      let attrs = node.attributes;
      if (attrs) {
        let defaultValues = new Map();
        for (let i = 0; i < attrs.length; i++) {
          let name = attrs[i].nodeName;
          defaultValues.set(name, attrDefaultValues[name]);
        }
        // Add some special cases that might not be included by enumerating
        // attributes above. Note: this list is probably not exhaustive.
        switch (obj.tagName) {
          case "input": {
            if (node.type === "checkbox" || node.type === "radio") {
              defaultValues.set("checked", false);
            } else if (node.type !== "file") {
              // Don't store the value for a file input.
              defaultValues.set("value", "");
            }
            break;
          }
          case "option": {
            defaultValues.set("selected", false);
            break;
          }
          case "textarea": {
            defaultValues.set("value", "");
            break;
          }
        }
        let arr = [];
        for (let [name, defaultValue] of defaultValues) {
          let propName = propFix[name] || name;
          let specialGetter = specialGetters[propName];
          let value = specialGetter ? specialGetter(node) : node[propName];
          if (value !== defaultValue) {
            arr.push([name, value]);
          }
        }
        if (arr.length) {
          obj.attributes = arr;
        }
      }
      let childNodes = node.childNodes;
      // Don't process children for a textarea since we used `value` above.
      if (obj.tagName !== "textarea" && childNodes && childNodes.length) {
        let arr = (obj.childNodes = []);
        for (let i = 0; i < childNodes.length; i++) {
          arr[i] = this.toJSON(childNodes[i]);
        }
      }
      return obj;
    },

    toDOM(input) {
      let obj = typeof input === "string" ? JSON.parse(input) : input;
      let propFix = { for: "htmlFor", class: "className" };
      let node;
      let nodeType = obj.nodeType;
      switch (nodeType) {
        // ELEMENT_NODE
        case 1: {
          node = document.createElement(obj.tagName);
          if (obj.attributes) {
            for (let [attrName, value] of obj.attributes) {
              let propName = propFix[attrName] || attrName;
              // Note: this will throw if setting the value of an input[type=file]
              node[propName] = value;
            }
          }
          break;
        }
        // TEXT_NODE
        case 3: {
          return document.createTextNode(obj.nodeValue);
        }
        // COMMENT_NODE
        case 8: {
          return document.createComment(obj.nodeValue);
        }
        // DOCUMENT_FRAGMENT_NODE
        case 11: {
          node = document.createDocumentFragment();
          break;
        }
        default: {
          // Default to an empty fragment node.
          return document.createDocumentFragment();
        }
      }
      if (obj.childNodes && obj.childNodes.length) {
        for (let childNode of obj.childNodes) {
          node.appendChild(this.toDOM(childNode));
        }
      }
      return node;
    },
  },
});
