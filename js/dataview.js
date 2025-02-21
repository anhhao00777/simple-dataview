class DataTableView{
    /**
     * 
     * @param {HTMLElement} container 
     * @param {Blob | ArrayBuffer} data 
     * @param {Object} option 
     */
    constructor(container, data, option = {}){
        if(!container) throw new Error("No container selected");
        if(!data) throw new Error("No file selected");
        this.container = container;
        this.obj = document.createElement("div");
        this.obj.className = "data-container row-fl";
        this.container.appendChild(this.obj);
        this.st = Date.now();
        this.tabConf = {};
        this.offset = 0;
        this.getData(data).then(d => {
            this.data = d;
            this.dv = new DataView(this.data);
            this.size = this.dv.byteLength;
            this.initHtml();

            this._load();
            this.addEv();
        });
    }
    initHtml(){
        this.obj.innerHTML = this.setHtml();
    }
    _load(){
        let t = this.getBoxSize();
        this.tabConf.row = t.w;
        this.tabConf.col = t.h;
        let max = t.w * t.h + this.offset;
        max = max >= this.size ? this.size : max;
        let hex = this.obj.querySelector(".hex-table");
        let char = this.obj.querySelector(".char-table");
        let hx = `<table>`;
        let ch = `<table>`;
        let current = this.offset;
        let text = "";
        for (let i = 0; i < t.h; i++) {
            hx += "<tr>"; ch += "<tr>";
            for (let j = 0; j < t.w; j++) {
                if(current >= max) break;
                const i8 = this.dv.getUint8(current);
                let tp = this.checkChar(i8);
                text += tp.res;
                hx += `<td data-t="${tp.type}" data-p="${current}">${i8.toString(16).toUpperCase()}</td>`;
                ch += `<td data-t="${tp.type}" data-p="${current}">${tp.res}</td>`;
                current++;
            }
            hx += "</tr>"; ch += "</tr>";
            
        }
        hx += `</table>`; ch += `</table>`;
        hex.innerHTML = hx;
        char.innerHTML = ch;
        this.obj.querySelector(".pos").value = this.offset;
        let z = document.createElement("p");
        z.innerText = text;
        this.obj.querySelector(".text-content").innerHTML = `
            <div class="value-gr">
                <div class="type">Text Content:</div>
                <div class="value">${z.innerHTML}</div>
            </div>
        `;
        z.remove();

    }
    toBin(num){
        let d = num.toString(2);
        let n = 8 - d.length;
        if(n > 0){
            for (let i = 0; i < n; i++) {
                d = "0"+d;
            }
        }
        return d;
    }
    nextPage(){
        let {w, h} = this.getBoxSize();
        let v = w*h;
        if((this.offset + v) >= this.size) return;
        this.offset += v;
    }
    prevPage(){
        let {w, h} = this.getBoxSize();
        let v = w*h;
        if((this.offset - v) < 0) {
            this.offset = 0;
            return;
        };
        this.offset -= v;
    }
    getBoxSize(){
        let s = {
            w: 1,
            h: 1
        }
        let {offsetHeight, offsetWidth} = this.obj.querySelector(".hex-table");
        s.w = Math.floor(offsetWidth/30);
        s.h = Math.floor(offsetHeight/30);
        return s;
    }
    addEv(){
        const scope = this;
        this.obj.addEventListener("click", (e)=>{
            if(e.target.nodeName == "TD"){
                let {p} = e.target.dataset;
                this.getSideInfo(p);
                document.querySelector(".fast-sl-" + this.st).innerHTML = `
                    .st-${this.st} > * > * > * > td[data-p="${p}"] { background: #00ffff60 !important; }
                `;
                this.obj.querySelector(".pos").value = p*1;
            } else if (e.target.classList[1] == "-prev") {
                this.prevPage();
                this._load();
            } else if (e.target.classList[1] == "-next"){
                this.nextPage();
                this._load();
            } else if (e.target.classList[1] == "-zero"){
                this.offset = 0;
                this._load();
            } else if (e.target.classList[1] == "-max"){
                this.offset = this.size-1;
                this._load();
            } else if (e.target.classList[1] == "-search"){
                let value = [];
                this.obj.querySelectorAll(".search-byte").forEach(e =>{
                    if(e.value) value.push(e.value);
                });
                if(value.length < 2) {
                    alert("need 2 value +");
                    return;
                }
                let pos = null;
                for (let i = 0; i < this.size; i++) {
                    const e = this.dv.getUint8(i);
                    if(e == value[0]){
                        let b = [];
                        for (let j = 1; j < value.length; j++) {
                            const a = this.dv.getUint8(i+j);
                            if(a == value[j]) b.push(1);
                        }
                        if(b.length == value.length-1){
                            pos = i;
                            break;
                        }
                    }
                }

                this.offset = pos;
                this._load();
            }
        });
        this.obj.querySelectorAll(".search-byte").forEach(el =>{
            el.addEventListener("keydown", function (e){
                e.preventDefault();
            });
            el.addEventListener("contextmenu", function (e){
                e.preventDefault();
                this.value = "";
            });
            
            el.addEventListener("keyup", function (e){
                e.preventDefault();
                if (e.keyCode > 31 && e.keyCode < 127) {
                    if(e.keyCode > 64 && e.keyCode < 91){
                        if(!e.shiftKey) this.value = e.keyCode + 32;
                        else this.value = e.keyCode;
                    } else{
                        this.value = e.keyCode;
                    }
                    e.target.nextElementSibling.focus();
                }
                
            });
        });
        this.obj.querySelector(".pos").addEventListener("change", function(e){
            if(this.value){
                let n = parseInt(this.value);
                if(n >= 0 && scope.size > n){
                    scope.offset = n;
                    scope._load();
                }
            } else{
                scope.offset = 0;
                scope._load();
            }
        });
    }
    getSideInfo(offset){
        let el = this.obj.querySelector(".value-view > .val-view");
        offset *= 1;
        const i8 = this.dv.getUint8(offset);
        const i16 = (offset + 1) < this.size ? this.dv.getUint16(offset) : "X";
        const i16l = (offset + 1) < this.size ? this.dv.getUint16(offset, true) : "X";
        const i32 = (offset + 3) < this.size ? this.dv.getUint32(offset) : "X";
        const i32l = (offset + 3) < this.size ? this.dv.getUint32(offset, true) : "X";
        const f32 = (offset + 3) < this.size ? this.dv.getFloat32(offset) : "X";
        const f32l = (offset + 3) < this.size ? this.dv.getFloat32(offset, true) : "X";
        let h = `
            <div class="value-gr">
                <div class="type">Uint8</div>
                <div class="value">${i8}</div>
            </div>
            <div class="value-gr">
                <div class="type" title="BigEndian \nLittleEndian">Uint16</div>
                <div class="value"><div>${i16}</div> <div>${i16l}</div></div>
            </div>
            <div class="value-gr" title="BigEndian \nLittleEndian">
                <div class="type">Uint32</div>
                <div class="value"><div>${i32}</div> <div>${i32l}</div></div>
            </div>
            <div class="value-gr" title="BigEndian \nLittleEndian">
                <div class="type">Float32</div>
                <div class="value"><div>${f32}</div> <div>${f32l}</div></div>
            </div>
            <div class="value-gr" title="BigEndian -- LittleEndian">
                <div class="type">Char (Uint16)</div>
                <div class="value"><span>${String.fromCharCode(i16)}</span> -- <span>${String.fromCharCode(i16l)}</span></div>
            </div>
        `;
        el.innerHTML = h;
        let bin = this.toBin(i8);
        this.obj.querySelector(".bin-value").innerHTML = `
            <div class="value-gr">
                <div class="type">Bin</div>
                <div class="value">${bin}</div>
            </div>
        `;
        

    }
    checkChar(ch){
        let t = {
            type: 0,
            res: ""
        };
        t.res = String.fromCharCode(ch);
        if(ch > 31 && ch < 127){
            t.type = 1;
        } else if(ch == 0){
            t.type = 2
            // t.res = " ";
        } else if(ch < 32 || ch == 127){
            t.type = 3;
        } else if(ch > 255){
            t.type = 4;

        } else if (ch > 127){
            t.type = 5;
        }
        return t;
    }
    /**
     * 
     * @param {Blob | ArrayBuffer} data 
     */
    async getData(data){
        if(typeof data == "object" && data.size){
            return await data.arrayBuffer();
        } else if(typeof data == "object" && data.byteLength){
            return data;
        } else if(typeof data == "string"){
            let r = await fetch(data);
            let b = await r.arrayBuffer();
            return b;
        }
         else {
            throw new Error("unknow data: " + data);
        }
    }
    setHtml(){
        return `
            <div class="buffer-view">
                <div class="head-btn">
                    <div class="btn-list">
                        <button class="cs-btn -zero">00</button>
                        <button class="cs-btn -prev">Prev</button>
                        <input type="text" class="cs-input pos"> <span class="max-byte">/${this.size}</span>
                        <button class="cs-btn -next">Next</button>
                        <button class="cs-btn -max">Max</button>
                    </div>
                    <div class="btn-list">
                        <input type="number" class="cs-input search-byte"> <input type="number" class="cs-input search-byte">
                        <input type="number" class="cs-input search-byte"> <input type="number" class="cs-input search-byte">
                        <button class="cs-btn -search">Search</button>

                    </div>
                </div>
                <div class="table row-fl">
                    <div class="hex-table st-${this.st}"></div>
                    <div class="char-table st-${this.st}"></div>
                </div>
            </div>
            <div class="value-view">
                <div class="val-view">
                    
                </div>
                <div class="misc">
                    <div class="bin-value"></div>
                    <div class="text-content"></div>
                
                </div>
            </div>
            <style class="fast-sl-${this.st}"></style>
        `;
    }
}
