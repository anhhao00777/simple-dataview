let leftView;
let rightView;
document.querySelector(".top-bar").addEventListener("click", async (e)=>{
    if(e.target.classList[1] == "-file-l"){
        let f = await getFile();
        if(leftView) leftView.obj.remove();
        if(f){
            leftView = new DataTableView(document.querySelector(".inner > .lf"), f);
        }
    }
    if(e.target.classList[1] == "-file-r"){
        let f = await getFile();
        if(rightView) rightView.obj.remove();
        if(f){
            rightView = new DataTableView(document.querySelector(".inner > .rd"), f);
        }
    }
});
(()=>{
    let dragElm = document.querySelector(".drag-sup");
    let isDr = false;
    let pos = 0;
    window.addEventListener("dragover", (e)=>{
        e.preventDefault();
        dragElm.style.display = "flex";
        isDr = true;
        if(isDr){
            let {x} = e;
            if(x > (window.innerWidth/2)){
                dragElm.style.left = "unset";
                dragElm.style.right = "0px";
                dragElm.querySelector(".drag-text").innerText = "Drop File On Right Side";
                pos = 1;
            } else{
                dragElm.style.left = "0px";
                dragElm.style.right = "unset";
                dragElm.querySelector(".drag-text").innerText = "Drop File On Left Side";
                pos = 0;
            }
        }
    });
    window.addEventListener("dragleave", (e)=>{
        e.preventDefault();
        dragElm.style.display = "";
        isDr = false;
    });
    window.addEventListener("drop", (e)=>{
        e.preventDefault();
        dragElm.style.display = "";
        isDr = false;
        let f = e.dataTransfer.files[0];
        if(pos == 0) {
            if(leftView) leftView.obj.remove();
            if(f){
                leftView = new DataTableView(document.querySelector(".inner > .lf"), f);
            }
        } else if(pos == 1){
            if(rightView) rightView.obj.remove();
            if(f){
                rightView = new DataTableView(document.querySelector(".inner > .rd"), f);
            }
        }
    });
})();



function getFile() {
    return new Promise(async (resolve, reject) => {
        if (window.showOpenFilePicker) {
            let h = await window.showOpenFilePicker();
            let f = await h[0].getFile();
            resolve(f);
        } else{
            let f = document.querySelector("#get-file");
            if(f){
                f.onchange = ()=>{
                    if(f.files[0]){
                        resolve(f.files[0]);
                    } else{
                        reject();
                    }
                }
                f.click();
            }
        }
    });
}
