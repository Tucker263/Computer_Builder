const config = {
    target: document.getElementById("target"),
    url: "https://api.recursionist.io/builder/computers?type=",
    gaming: {
        "CPU": 0.25,
        "GPU": 0.6,
        "RAM": 0.125,
        "HDD": 0.025,
        "SSD": 0.1
    },
    work: {
        "CPU": 0.6,
        "GPU": 0.25,
        "RAM": 0.1,
        "HDD": 0.05,
        "SSD": 0.05,
    }
};

class SetterHelper{
    static getRamAmount(ram){
        let stringArr = ram.Model.split(" ");
        let string = stringArr[stringArr.length - 1];
        return string.substring(0, string.indexOf("x"));
    }

    //ストレージのバイト数配列を取得
    static getStorageBiteArr(storageParts){
        let gbArr = SetterHelper.getBiteArr(storageParts, "GB");
        let tbArr = SetterHelper.getBiteArr(storageParts, "TB");
        return tbArr.concat(gbArr);
    }

    //Biteの配列をパーツ配列とタイプ(TBかGB)から取得
    static getBiteArr(storageParts, type){
        let biteArr = storageParts.map(parts => parts.Model)
                                .filter(model => model.includes(type))
                                .map(model => SetterHelper.getBitefromModel(model, type))
                                .sort((a, b) => b - a)
                                .map(amount => amount + type);
        return SetterHelper.removeDuplicateInArr(biteArr);
    }

    //Biteをモデルとタイプから取得
    static getBitefromModel(model, type){
        let biteString = model.split(" ")
                              .filter(string => string.includes(type))
                              .join("");
        let atBite = biteString.indexOf(type);
        return biteString.substring(0, atBite);
    }

    //GB、TBをモデルから取得
    static getGTBitefromModel(model){
        let type = model.includes("GB") ? "GB" : "TB";
        let biteString = model.split(" ")
                              .filter(string => string.includes(type))
                              .join("");
        let atBite = biteString.indexOf(type);
        return biteString.substring(0, atBite + 2);
    }

    //配列の重複を削除
    static removeDuplicateInArr(arr){
        let output = [];
        let hashmap = {};
        arr.forEach(value => hashmap[value] = value);
        for(let key in hashmap) output.push(key);
        return output;
    }
}

class Model{
    static pcParts = {};
    static partsModel = {};

    static setCpuParts(partsArr){
        partsArr.forEach(parts => Model.pcParts[parts.Type] = {});
        partsArr.forEach(parts => Model.pcParts[parts.Type][parts.Brand] = {});
        partsArr.forEach(parts => Model.pcParts[parts.Type][parts.Brand][parts.Model] = parts);
        partsArr.forEach(parts => Model.partsModel[parts.Model] = parts);
    }

    static setGpuParts(partsArr){
        Model.setCpuParts(partsArr);
    }

    static setRamParts(partsArr){
        partsArr.forEach(parts => Model.pcParts[parts.Type] = {});
        partsArr.forEach(parts => Model.pcParts[parts.Type][SetterHelper.getRamAmount(parts)] = {});
        partsArr.forEach(parts => Model.pcParts[parts.Type][SetterHelper.getRamAmount(parts)][parts.Brand] = {});
        partsArr.forEach(parts => Model.pcParts[parts.Type][SetterHelper.getRamAmount(parts)][parts.Brand][parts.Model] = parts);
        partsArr.forEach(parts => Model.partsModel[parts.Model] = parts);
    }

    static setStorageParts(partsArr){
        partsArr.forEach(parts => Model.pcParts[parts.Type] = {});
        //バイト数配列を取得
        let biteArr = SetterHelper.getStorageBiteArr(partsArr);
        biteArr.forEach(bite => Model.pcParts[partsArr[0].Type][bite] = {});
        partsArr.forEach(parts => Model.pcParts[parts.Type][SetterHelper.getGTBitefromModel(parts.Model)][parts.Brand] = {});
        partsArr.forEach(parts => Model.pcParts[parts.Type][SetterHelper.getGTBitefromModel(parts.Model)][parts.Brand][parts.Model] = parts);
        partsArr.forEach(parts => Model.partsModel[parts.Model] = parts);
    }

    static freezeStaticMember(){
        Object.freeze(Model.pcParts);
        Object.freeze(Model.partsModel);
    }

    static getCpuBrandArr(){
        return Object.keys(Model.pcParts["CPU"]);
    }

    static getCpuModelArr(brand){
        return Object.keys(Model.pcParts["CPU"][brand]);
    }

    static getGpuBrandArr(){
        return Object.keys(Model.pcParts["GPU"]);
    }

    static getGpuModelArr(brand){
        return Object.keys(Model.pcParts["GPU"][brand]);
    }

    static getRamAmountArr(){
        return Object.keys(Model.pcParts["RAM"]);
    }

    static getRamBrandArr(amount){
        return Object.keys(Model.pcParts["RAM"][amount]);
    }

    static getRamModelArr(amount, brand){
        return Object.keys(Model.pcParts["RAM"][amount][brand]);
    }

    static getStorageBiteArr(type){
        return Object.keys(Model.pcParts[type]);
    }

    static getStorageBrandArr(type, bite){
        return Object.keys(Model.pcParts[type][bite]);
    }

    static getStorageModelArr(type, bite, brand){
        return Object.keys(Model.pcParts[type][bite][brand]);
    }

    static getParts(model){
        return Model.partsModel[model];
    }

    static calculateGamingScore(partsArr){
        return Math.round(partsArr.map(parts => parts.Benchmark * config.gaming[parts.Type])
                                  .reduce((curr, total) => curr + total));
    }

    static calculateWorkScore(partsArr){
        return Math.round(partsArr.map(parts => parts.Benchmark * config.work[parts.Type])
                                  .reduce((curr, total) => curr + total));
    }
}

class View{
    static setInitPage(){
        config.target.innerHTML = ``;
        config.target.append(View.createTitleDiv());

        let frameDiv = document.createElement("div");
        frameDiv.classList.add("bg-light", "p-3");
        frameDiv.append(View.createSelectDiv());
        frameDiv.append(View.createButtonDiv());
        frameDiv.append(View.createResultDiv());
        config.target.append(frameDiv);

        View.setOptionsByFetch();
        View.setEventListener();
    }

    static createTitleDiv(){
        let titleDiv = document.createElement("div");
        titleDiv.classList.add("bg-secondary", "text-white", "text-center", "p-2");
        titleDiv.innerHTML = `<h1><i class="fas fa-desktop mr-2"></i>Build Your Own Computer</h1>`;
        return titleDiv;
    }

    static createSelectDiv(){
        let selectDiv = document.createElement("div");
        selectDiv.innerHTML += `
            <div class="pt-3 pb-3">
                <h5>step1: Select your CPU</h5>
                <div class="d-sm-flex align-items-center" id="select1">
                    <div class="col-12 col-sm-4">
                        <div class="d-sm-flex">
                            <p class="fontSize-1p25 mt-1 mr-2">Brand</p>
                            <select class="custom-select col-9" id="option1">
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-sm-4">
                        <div class="d-sm-flex">
                            <p class="fontSize-1p25 mt-1 mr-2">Model</p>
                            <select class="custom-select col-9" id="option2">
                                <option selected>-</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pt-3 pb-3">
                <h5>step2: Select your GPU</h5>
                <div class="d-sm-flex align-items-center" id="select2">
                    <div class="col-12 col-sm-4">
                        <div class="d-sm-flex">
                            <p class="fontSize-1p25 mt-1 mr-2">Brand</p>
                            <select class="custom-select col-9" id="option1">
                                <option selected>-</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-sm-4">
                        <div class="d-sm-flex">
                            <p class="fontSize-1p25 mt-1 mr-2">Model</p>
                            <select class="custom-select col-9" id="option2">
                                <option selected>-</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pt-3 pb-3">
                <h5>step3: Select your memory card</h5>
                <div class="d-sm-flex align-items-center" id="select3">
                    <div class="col-12 col-sm-4">
                        <div class="d-sm-flex align-items-center">
                            <p class="fontSize-1p25 mt-1 mr-2">How many?</p>
                            <select class="custom-select col-9 col-sm-6" id="option1">
                                <option selected>-</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-sm-4">
                        <div class="d-sm-flex">
                            <p class="fontSize-1p25 mt-1 mr-2">Brand</p>
                            <select class="custom-select col-9" id="option2">
                                <option selected>-</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-sm-4">
                        <div class="d-sm-flex">
                            <p class="fontSize-1p25 mt-1 mr-2">Model</p>
                            <select class="custom-select col-9" id="option3">
                                <option selected>-</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pt-3 pb-3">
                <h5>step4: Select your storage</h5>
                <div class="d-sm-flex align-items-center" id="select4">
                    <div class="col-12 col-sm-3">
                        <div class="d-sm-flex align-items-center">
                            <p class="fontSize-1p25 mt-1 mr-1">HDD or SSD</p>
                            <select class="custom-select col-9 col-sm-6 col-md-9" id="option1">
                                <option selected>-</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-sm-3">
                        <div class="d-sm-flex">
                            <p class="fontSize-1p25 mt-1 mr-1">Storage</p>
                            <select class="custom-select col-9 col-sm-8 col-md-9" id="option2">
                                <option selected>-</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-sm-3">
                        <div class="d-sm-flex">
                            <p class="fontSize-1p25 mt-1 mr-1">Brand</p>
                            <select class="custom-select col-9" id="option3">
                                <option selected>-</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-sm-3">
                        <div class="d-sm-flex">
                            <p class="fontSize-1p25 mt-1 mr-1">Model</p>
                            <select class="custom-select col-9" id="option4">
                                <option selected>-</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return selectDiv;
    }

    static createButtonDiv(){
        let buttonDiv = document.createElement("div");
        buttonDiv.classList.add("d-flex", "pb-4");
        buttonDiv.innerHTML += `
            <button type="button" class="btn btn-primary col-3 col-md-2" id="buildButton">Add PC</button>
            <p class="text-danger col-9 mt-2">クリックされると以下に結果を表示</p>
        `;
        return buttonDiv;
    }

    static createResultDiv(){
        let resultDiv = document.createElement("div");
        resultDiv.id = "result";
        return resultDiv;
    }

    //fetchで選択肢をセット
    static setOptionsByFetch(){
        View.setSelect1();
        View.setSelect2();
        View.setSelect3();
        View.setSelect4();
    }

    static setSelect1(){
        fetch(config.url + "cpu").then(response => response.json()).then(data => {
            Controller.setCpuParts(data);
            let select1 = config.target.querySelectorAll("#select1")[0];
            let option1 = select1.querySelectorAll("#option1")[0];
            option1.innerHTML = `<option selected>-</option>`;
            let cpuBrandArr = Controller.getCpuBrandArr();
            cpuBrandArr.forEach(cpuBrand => {
                option1.innerHTML += `<option value="${cpuBrand}">${cpuBrand}</option>`;
            });
        });
    }

    static setSelect2(){
        fetch(config.url + "gpu").then(response => response.json()).then(data => {
            Controller.setGpuParts(data);
            let select2 = config.target.querySelectorAll("#select2")[0];
            let option1 = select2.querySelectorAll("#option1")[0];
            option1.innerHTML = `<option selected>-</option>`;
            let gpuBrandArr = Controller.getGpuBrandArr();
            gpuBrandArr.forEach(gpuBrand => {
                option1.innerHTML += `<option value="${gpuBrand}">${gpuBrand}</option>`;
            });
        });
    }

    static setSelect3(){
        fetch(config.url + "ram").then(response => response.json()).then(data => {
            Controller.setRamParts(data);
            let select3 = config.target.querySelectorAll("#select3")[0];
            let option1 = select3.querySelectorAll("#option1")[0];
            option1.innerHTML = `<option selected>-</option>`;
            let ramAmountArr = Controller.getRamAmountArr();
            ramAmountArr.forEach(ramAmount => {
                option1.innerHTML += `<option value="${ramAmount}">${ramAmount}</option>`;
            });
        });
    }

    static setSelect4(){
        fetch(config.url + "hdd").then(response => response.json()).then(data => {
            Controller.setStorageParts(data);
            let select4 = config.target.querySelectorAll("#select4")[0];
            let option1 = select4.querySelectorAll("#option1")[0];
            option1.innerHTML = `<option selected>-</option>`;
            option1.innerHTML += ` <option value="HDD">HDD</option>`;
        });
        fetch(config.url + "ssd").then(response => response.json()).then(data => {
            Controller.setStorageParts(data);
            setTimeout(() => Controller.freezeStaticMember(), 2000);
            let select4 = config.target.querySelectorAll("#select4")[0];
            let option1 = select4.querySelectorAll("#option1")[0];
            option1.innerHTML += `<option value="SSD">SSD</option>`;
        });
    }

    //イベントリスナーのセット
    static setEventListener(){
        View.setEventListenerOfS1();
        View.setEventListenerOfS2();
        View.setEventListenerOfS3();
        View.setEventListenerOfS4();
        View.setEventListenerButton();
    }

    static setEventListenerOfS1(){//S1はselect1の略
        let select1 = config.target.querySelectorAll("#select1")[0];
        let option1 = select1.querySelectorAll("#option1")[0];
        let option2 = select1.querySelectorAll("#option2")[0];
        //option1の設定
        option1.addEventListener("change", () => {
            option2.innerHTML = `<option selected>-</option>`;
            if(option1.value !== "-"){
                let cpuModelArr = Controller.getCpuModelArr(option1.value);
                cpuModelArr.forEach(cpuModel => {
                    option2.innerHTML += `<option value="${cpuModel}">${cpuModel}</option>`;
                });
            }
        });
    }

    static setEventListenerOfS2(){//S2はselect2の略
        let select2 = config.target.querySelectorAll("#select2")[0];
        let option1 = select2.querySelectorAll("#option1")[0];
        let option2 = select2.querySelectorAll("#option2")[0];
        //option1の設定
        option1.addEventListener("change", () => {
            option2.innerHTML = `<option selected>-</option>`;
            if(option1.value !== "-"){
                let gpuModelArr = Controller.getGpuModelArr(option1.value);
                gpuModelArr.forEach(gpuModel => {
                    option2.innerHTML += `<option value="${gpuModel}">${gpuModel}</option>`;
                });
            }
        });
    }

    static setEventListenerOfS3(){//S3はselect3の略
        let select3 = config.target.querySelectorAll("#select3")[0];
        let option1 = select3.querySelectorAll("#option1")[0];
        let option2 = select3.querySelectorAll("#option2")[0];
        let option3 = select3.querySelectorAll("#option3")[0];
        //option1の設定
        option1.addEventListener("change", () => {
            option2.innerHTML = `<option selected>-</option>`;
            option3.innerHTML = `<option selected>-</option>`;
            if(option1.value !== "-"){
                let brandArr = Controller.getRamBrandArr(option1.value);
                brandArr.forEach(ramBrand => {
                    option2.innerHTML += `<option value="${ramBrand}">${ramBrand}</option>`;
                });
            }
        });
        //option2の設定
        option2.addEventListener("change", () => {
            option3.innerHTML = `<option selected>-</option>`;
            if(option2.value !== "-"){
                let ramModelArr = Controller.getRamModelArr(option1.value, option2.value);
                ramModelArr.forEach(ramModel => {
                    option3.innerHTML += `<option value="${ramModel}">${ramModel}</option>`;
                });
            }
        });
    }

    static setEventListenerOfS4(){//S4はselect4の略
        let select4 = config.target.querySelectorAll("#select4")[0];
        let option1 = select4.querySelectorAll("#option1")[0];
        let option2 = select4.querySelectorAll("#option2")[0];
        let option3 = select4.querySelectorAll("#option3")[0];
        let option4 = select4.querySelectorAll("#option4")[0];
        //option1の設定
        option1.addEventListener("change", () => {
            option2.innerHTML = `<option selected>-</option>`;
            option3.innerHTML = `<option selected>-</option>`;
            option4.innerHTML = `<option selected>-</option>`;
            let biteArr = Controller.getStorageBiteArr(option1.value);
            biteArr.forEach(bite => {
                option2.innerHTML += `<option value="${bite}">${bite}</option>`;
            });
        });
        //option2の設定
        option2.addEventListener("change", () => {
            option3.innerHTML = `<option selected>-</option>`;
            option4.innerHTML = `<option selected>-</option>`;
            let brandArr = Controller.getStorageBrandArr(option1.value, option2.value);
            brandArr.forEach(brand => {
                option3.innerHTML += `<option value="${brand}">${brand}</option>`;
            });
        });
        //option3の設定
        option3.addEventListener("change", () => {
            option4.innerHTML = `<option selected>-</option>`;
            let modelArr = Model.getStorageModelArr(option1.value, option2.value, option3.value);
            modelArr.forEach(model => {
                option4.innerHTML += `<option value="${model}">${model}</option>`;
            });
        });
    }

    static setEventListenerButton(){
        let button = config.target.querySelectorAll("#buildButton")[0];
        button.addEventListener("click", () => {
            let cpuModel = config.target
                                .querySelectorAll("#select1")[0]
                                .querySelectorAll("#option2")[0]
                                .value;
            let gpuModel = config.target
                                .querySelectorAll("#select2")[0]
                                .querySelectorAll("#option2")[0]
                                .value;
            let ramModel = config.target
                                .querySelectorAll("#select3")[0]
                                .querySelectorAll("#option3")[0]
                                .value;
            let storageModel = config.target
                                    .querySelectorAll("#select4")[0]
                                    .querySelectorAll("#option4")[0]
                                    .value;
            //テスト用--------------------
            cpuModel = "Core i9-10900K";
            gpuModel = "Radeon-VII";
            ramModel = "Vengeance LPX DDR4 3000 C15 4x4GB";
            storageModel = "XPG SX8200 NVMe PCIe M.2 960GB";//*/


            if(![cpuModel, gpuModel, ramModel, storageModel].includes("-")){
                let cpu = Controller.getParts(cpuModel);
                let gpu = Controller.getParts(gpuModel);
                let ram = Controller.getParts(ramModel);
                let storage = Controller.getParts(storageModel);
        
                let partsArr = [cpu, gpu, ram, storage];
                let gamingScore = Controller.calculateGamingScore(partsArr);
                let workScore = Controller.calculateWorkScore(partsArr);
                //結果を画面に表示
                let resultLayout = ``;
                resultLayout = `
                <div class="col-12 d-flex justify-content-center">
                <div class="bg-lightblue font-weight-bold p-2 mb-2 col-12 col-md-9">
                    <div class="d-flex flex-wrap">
                        <div class="col-6 border">
                            <p>CPU</p>
                            <p>Brand:${cpu.Brand}</p>
                            <p>Model:${cpu.Model}</p>
                        </div>
                        <div class="col-6 border">
                            <p>GPU</p>
                            <p>Brand:${gpu.Brand}</p>
                            <p>Model:${gpu.Model}</p>
                        </div>
                        <div class="col-6 border">
                            <p>RAM</p>
                            <p>Brand:${ram.Brand}</p>
                            <p>Model:${ram.Model}</p>
                        </div>
                        <div class="col-6 border">
                            <p>Storage</p>
                            <p>Brand:${storage.Brand}</p>
                            <p>Model:${storage.Model}</p>
                        </div>
                    </div>
                    <div class="d-flex justify-content-around">
                        <p class="col-5">Gaming: ${gamingScore}%</h6>
                        <p class="col-5">Work: ${workScore}%</h>
                    </div>
                </div>
                </div>
                `;

                let result = config.target.querySelectorAll("#result")[0];
                result.innerHTML = resultLayout;


            }else{
                let result = config.target.querySelectorAll("#result")[0];
                result.innerHTML = ``;
                alert("全ての項目を入力してください");
            }
        });
    }
}

class Controller{
    static startPage(){
        View.setInitPage();
    }

    static setCpuParts(partsArr){
        Model.setCpuParts(partsArr);
    }

    static setGpuParts(partsArr){
        Model.setGpuParts(partsArr);
    }

    static setRamParts(partsArr){
        Model.setRamParts(partsArr);
    }

    static setStorageParts(partsArr){
        Model.setStorageParts(partsArr);
    }

    static freezeStaticMember(){
        Model.freezeStaticMember();
    }
    
    static getCpuBrandArr(){
        return Model.getCpuBrandArr();
    }

    static getCpuModelArr(brand){
        return Model.getCpuModelArr(brand);
    }

    static getGpuBrandArr(){
        return Model.getGpuBrandArr();
    }

    static getGpuModelArr(brand){
        return Model.getGpuModelArr(brand);
    }

    static getRamAmountArr(){
        return Model.getRamAmountArr();
    }

    static getRamBrandArr(amount){
        return Model.getRamBrandArr(amount);
    }

    static getRamModelArr(amount, brand){
        return Model.getRamModelArr(amount, brand);
    }

    static getStorageBiteArr(type){
        return Model.getStorageBiteArr(type);
    }

    static getStorageBrandArr(type, bite){
        return Model.getStorageBrandArr(type, bite);
    }

    static getStorageModelArr(type, bite, brand){
        return Model.getStorageModelArr(type, bite, brand);
    }

    static getParts(model){
        return Model.getParts(model);
    }

    static calculateGamingScore(partsArr){
        return Model.calculateGamingScore(partsArr);
    }

    static calculateWorkScore(partsArr){
        return Model.calculateWorkScore(partsArr);
    }
}

Controller.startPage();