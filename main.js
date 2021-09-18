const config = {
    target: document.getElementById("target"),
    url: "https://api.recursionist.io/builder/computers?type=",
    stepTitle: ["Select your CPU", 
                "Select your GPU", 
                "Select your memory card", 
                "Select your storage"],
    optionArr2d: [["Brand", "Model"], 
                  ["Brand", "Model"], 
                  ["How many?", "Brand", "Model"], 
                  ["HDD or SSD", "Storage", "Brand", "Model"]],
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
        config.target.append(View.createBodyDiv());
        View.setStepOptionsByFetch();
        View.setEventListener();
    }

    static createTitleDiv(){
        let titleDiv = document.createElement("div");
        titleDiv.classList.add("bg-secondary", "text-white", "text-center", "p-2");
        titleDiv.innerHTML = `<h1><i class="fas fa-desktop mr-2"></i>Build Your Own Computer</h1>`;
        return titleDiv;
    }

    static createBodyDiv(){
        let bodyDiv = document.createElement("div");
        bodyDiv.classList.add("bg-light", "p-3", "pl-md-5", "pr-md-5");
        for(let i = 0; i < config.stepTitle.length; i++){
            bodyDiv.append(View.createStepDiv(config.stepTitle[i], i + 1, config.optionArr2d[i]));
        }
        bodyDiv.append(View.createButtonDiv());
        bodyDiv.append(View.createResultDiv());
        return bodyDiv;
    }

    static createStepDiv(stepTitle, stepId, titleArr){
        let stepDiv = document.createElement("div");
        stepDiv.classList.add("pt-3", "pb-3");
        stepDiv.innerHTML = `<h5>step${stepId}: ${stepTitle}</h5>`;
        stepDiv.append(View.createOptionDiv(stepId, titleArr));
        return stepDiv;
    }

    static createOptionDiv(stepId, titleArr){
        let optionDiv = document.createElement("div");
        optionDiv.classList.add("d-sm-flex", "align-items-center", "flex-wrap");
        optionDiv.id = `step${stepId}`;
        for(let i = 0; i < titleArr.length; i++) optionDiv.append(View.createOptionBody(titleArr[i], i + 1));
        return optionDiv;
    }

    static createOptionBody(optionTitle, optionId){
        let optionBody = document.createElement("div");
        optionBody.classList.add("col-12", "col-sm-6");
        optionBody.innerHTML = `
            <div class="d-sm-flex align-items-center">
                <p class="fontSize-1p25 mt-1 col-12 col-sm-4">${optionTitle}</p>
                <select class="custom-select col-8" id="option${optionId}">
                    <option selected>-</option>
                </select>
            </div>
        `;
        return optionBody;
    }

    static createButtonDiv(){
        let buttonDiv = document.createElement("div");
        buttonDiv.classList.add("d-flex", "pb-4");
        buttonDiv.innerHTML += `
            <button type="button" class="btn btn-primary col-3" id="buildButton">Add PC</button>
            <p class="text-danger col-9 mt-2">クリックされると以下に結果を表示</p>
        `;
        return buttonDiv;
    }

    static createResultDiv(){
        let resultDiv = document.createElement("div");
        resultDiv.id = "result";
        return resultDiv;
    }

    //APIでデータの取得とoptionsのセット
    static setStepOptionsByFetch(){
        View.setOptionsOfStep1();
        View.setOptionsOfStep2();
        View.setOptionsOfStep3();
        View.setOptionsOfStep4();
    }

    static setOptionsOfStep1(){
        fetch(config.url + "cpu").then(response => response.json()).then(data => {
            Controller.setCpuParts(data);
            let option1 = config.target.querySelectorAll("#step1")[0]
                                       .querySelectorAll("#option1")[0];
            option1.innerHTML = `<option selected>-</option>`;
            Controller.getCpuBrandArr()
                      .forEach(cpuBrand => {
                        option1.innerHTML += `<option value="${cpuBrand}">${cpuBrand}</option>`;
                      });
        });
    }

    static setOptionsOfStep2(){
        fetch(config.url + "gpu").then(response => response.json()).then(data => {
            Controller.setGpuParts(data);
            let option1 = config.target.querySelectorAll("#step2")[0]
                                       .querySelectorAll("#option1")[0];
            option1.innerHTML = `<option selected>-</option>`;
            Controller.getGpuBrandArr()
                      .forEach(gpuBrand => {
                        option1.innerHTML += `<option value="${gpuBrand}">${gpuBrand}</option>`;
                      });
        });
    }

    static setOptionsOfStep3(){
        fetch(config.url + "ram").then(response => response.json()).then(data => {
            Controller.setRamParts(data);
            let option1 = config.target.querySelectorAll("#step3")[0]
                                       .querySelectorAll("#option1")[0];
            option1.innerHTML = `<option selected>-</option>`;
            Controller.getRamAmountArr()
                      .forEach(ramAmount => {
                        option1.innerHTML += `<option value="${ramAmount}">${ramAmount}</option>`;
                      });
        });
    }

    static setOptionsOfStep4(){
        fetch(config.url + "hdd").then(response => response.json()).then(data => {
            Controller.setStorageParts(data);
        });
        fetch(config.url + "ssd").then(response => response.json()).then(data => {
            Controller.setStorageParts(data);
            //1秒後に取得したデータを固定
            setTimeout(() => Controller.freezeStaticMember(), 1000);
        });
        let option1 = config.target.querySelectorAll("#step4")[0]
                                   .querySelectorAll("#option1")[0];
        option1.innerHTML = `
            <option selected>-</option>
            <option value="HDD">HDD</option>
            <option value="SSD">SSD</option>
        `;
    }

    static setEventListener(){
        View.setEventListenerOfStep1();
        View.setEventListenerOfStep2();
        View.setEventListenerOfStep3();
        View.setEventListenerOfStep4();
        View.setEventListenerButton();
    }

    static setEventListenerOfStep1(){
        let step1 = config.target.querySelectorAll("#step1")[0];
        let option1 = step1.querySelectorAll("#option1")[0];
        let option2 = step1.querySelectorAll("#option2")[0];
        option1.addEventListener("change", () => {
            option2.innerHTML = `<option selected>-</option>`;
            if(option1.value !== "-"){
                Controller.getCpuModelArr(option1.value)
                          .forEach(cpuModel => {
                            option2.innerHTML += `<option value="${cpuModel}">${cpuModel}</option>`;
                          });
            }
        });
    }

    static setEventListenerOfStep2(){
        let step2 = config.target.querySelectorAll("#step2")[0];
        let option1 = step2.querySelectorAll("#option1")[0];
        let option2 = step2.querySelectorAll("#option2")[0];
        option1.addEventListener("change", () => {
            option2.innerHTML = `<option selected>-</option>`;
            if(option1.value !== "-"){
                Controller.getGpuModelArr(option1.value)
                          .forEach(gpuModel => {
                            option2.innerHTML += `<option value="${gpuModel}">${gpuModel}</option>`;
                          });
            }
        });
    }

    static setEventListenerOfStep3(){
        let step3 = config.target.querySelectorAll("#step3")[0];
        let option1 = step3.querySelectorAll("#option1")[0];
        let option2 = step3.querySelectorAll("#option2")[0];
        let option3 = step3.querySelectorAll("#option3")[0];
        option1.addEventListener("change", () => {
            option2.innerHTML = `<option selected>-</option>`;
            option3.innerHTML = `<option selected>-</option>`;
            if(option1.value !== "-"){
                Controller.getRamBrandArr(option1.value)
                          .forEach(ramBrand => {
                            option2.innerHTML += `<option value="${ramBrand}">${ramBrand}</option>`;
                          });
            }
        });
        option2.addEventListener("change", () => {
            option3.innerHTML = `<option selected>-</option>`;
            if(option2.value !== "-"){
                Controller.getRamModelArr(option1.value, option2.value)
                          .forEach(ramModel => {
                            option3.innerHTML += `<option value="${ramModel}">${ramModel}</option>`;
                          });
            }
        });
    }

    static setEventListenerOfStep4(){
        let step4 = config.target.querySelectorAll("#step4")[0];
        let option1 = step4.querySelectorAll("#option1")[0];
        let option2 = step4.querySelectorAll("#option2")[0];
        let option3 = step4.querySelectorAll("#option3")[0];
        let option4 = step4.querySelectorAll("#option4")[0];
        option1.addEventListener("change", () => {
            option2.innerHTML = `<option selected>-</option>`;
            option3.innerHTML = `<option selected>-</option>`;
            option4.innerHTML = `<option selected>-</option>`;
            if(option1.value !== "-"){
                Controller.getStorageBiteArr(option1.value)
                          .forEach(bite => {
                            option2.innerHTML += `<option value="${bite}">${bite}</option>`;
                          });
            }
        });
        option2.addEventListener("change", () => {
            option3.innerHTML = `<option selected>-</option>`;
            option4.innerHTML = `<option selected>-</option>`;
            if(option2.value !== "-"){
                Controller.getStorageBrandArr(option1.value, option2.value)
                          .forEach(brand => {
                            option3.innerHTML += `<option value="${brand}">${brand}</option>`;
                          });
            }
        });
        option3.addEventListener("change", () => {
            option4.innerHTML = `<option selected>-</option>`;
            if(option3.value !== "-"){
                Controller.getStorageModelArr(option1.value, option2.value, option3.value)
                          .forEach(model => {
                            option4.innerHTML += `<option value="${model}">${model}</option>`;
                          });
            }
        });
    }

    static setEventListenerButton(){
        let button = config.target.querySelectorAll("#buildButton")[0];
        button.addEventListener("click", () => {
            let cpuModel = config.target
                                .querySelectorAll("#step1")[0]
                                .querySelectorAll("#option2")[0]
                                .value;
            let gpuModel = config.target
                                .querySelectorAll("#step2")[0]
                                .querySelectorAll("#option2")[0]
                                .value;
            let ramModel = config.target
                                .querySelectorAll("#step3")[0]
                                .querySelectorAll("#option3")[0]
                                .value;
            let storageModel = config.target
                                    .querySelectorAll("#step4")[0]
                                    .querySelectorAll("#option4")[0]
                                    .value;
            if(![cpuModel, gpuModel, ramModel, storageModel].includes("-")){
                let partsArr = [Controller.getParts(cpuModel), 
                                Controller.getParts(gpuModel), 
                                Controller.getParts(ramModel), 
                                Controller.getParts(storageModel)];
                let gamingScore = Controller.calculateGamingScore(partsArr);
                let workScore = Controller.calculateWorkScore(partsArr);
                let resultDiv = config.target.querySelectorAll("#result")[0];
                resultDiv.innerHTML = ``;
                resultDiv.append(View.createResultFrame(partsArr, gamingScore, workScore));
            }else{
                config.target.querySelectorAll("#result")[0].innerHTML = ``;
                alert("全ての項目を入力してください");
            }
        });
    }

    static createResultFrame(partsArr, gamingScore, workScore){
        let resultFrame = document.createElement("div");
        resultFrame.classList.add("col-12", "d-flex",  "justify-content-center");
        let resultBody = document.createElement("div");
        resultBody.classList.add("bg-lightblue", "font-weight-bold", "p-2", "mb-2", "col-12", "col-md-9");
        resultBody.append(View.createPartsInfoDiv(partsArr));
        resultBody.append(View.createScoreInfoDiv(gamingScore, workScore));
        resultFrame.append(resultBody);                 
        return resultFrame;
    }

    static createPartsInfoDiv(partsArr){
        let partsInfoDiv = document.createElement("div");
        partsInfoDiv.classList.add("d-flex", "flex-wrap");
        partsArr.forEach(parts => {
            partsInfoDiv.innerHTML += `
                <div class="col-6 border">
                    <p>${parts.Type}</p>
                    <p>Brand: ${parts.Brand}</p>
                    <p>Model:<br>${parts.Model}</p>
                </div>
            `;
        });
        return partsInfoDiv;
    }

    static createScoreInfoDiv(gamingScore, workScore){
        let scoreInfoDiv = document.createElement("div");
        scoreInfoDiv.classList.add("d-flex", "justify-content-around", "fontSize-1p25");
        scoreInfoDiv.innerHTML = `
            <p class="col-5">Gaming: ${gamingScore}%</p>
            <p class="col-5">Work: ${workScore}%</p>
        `;
        return scoreInfoDiv;
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

//画面の起動
Controller.startPage();