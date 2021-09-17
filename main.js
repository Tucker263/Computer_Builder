const config = {
    target: document.getElementById("target"),
    url: "https://api.recursionist.io/builder/computers?type="
};

//セッターヘルパー関数
class SetterHelper{
    //ramの本数(amount)を取得
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
  /*pcPartsのデータ構造
    cpu:  pcParts[type][brand][model] = cpu本体
    gpu:  pcParts[type][brand][model] = gpu本体
    ram:  pcParts[type][amount][brand][model] = ram本体
    storage:  pcParts[type][bite][brand][model] = storage本体*/
    static pcParts = {};

    //pcModelsのデータ構造(パソコン構築時に使用、モデル名はすべて異なるはず)
    //model:  pcModels[model] = パーツ本体
    static pcModels = {};

    //セッター関数
    static setCpuParts(parts){
        parts.forEach(part => Model.pcParts[part.Type] = {});
        parts.forEach(part => Model.pcParts[part.Type][part.Brand] = {});
        parts.forEach(part => Model.pcParts[part.Type][part.Brand][part.Model] = part);

        parts.forEach(part => Model.pcModels[part.Model] = part);
    }

    static setGpuParts(parts){
        Model.setCpuParts(parts);//処理が同じ
    }

    static setRamParts(parts){
        parts.forEach(part => Model.pcParts[part.Type] = {});
        parts.forEach(part => Model.pcParts[part.Type][SetterHelper.getRamAmount(part)] = {});
        parts.forEach(part => Model.pcParts[part.Type][SetterHelper.getRamAmount(part)][part.Brand] = {});
        parts.forEach(part => Model.pcParts[part.Type][SetterHelper.getRamAmount(part)][part.Brand][part.Model] = part);

        parts.forEach(part => Model.pcModels[part.Model] = part);
    }

    static setStorageParts(parts){
        parts.forEach(part => Model.pcParts[part.Type] = {});
        //バイト数配列を取得
        let biteArr = SetterHelper.getStorageBiteArr(parts);
        biteArr.forEach(bite => Model.pcParts[parts[0].Type][bite] = {});
        parts.forEach(part => Model.pcParts[part.Type][SetterHelper.getGTBitefromModel(part.Model)][part.Brand] = {});
        parts.forEach(part => Model.pcParts[part.Type][SetterHelper.getGTBitefromModel(part.Model)][part.Brand][part.Model] = part);
    
        parts.forEach(part => Model.pcModels[part.Model] = part);
    }

    //ゲッター関数
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
        return Model.pcModels[model];
    }

    static calculateGamingScore(cpu, gpu, ram, storage){
        let gamingScore = 0;
        gamingScore += cpu.Benchmark * 0.25;
        gamingScore += gpu.Benchmark * 0.6;
        gamingScore += ram.Benchmark * 0.125;
        console.log(storage);
        switch(storage.Type){
            case "HDD":
                gamingScore += storage.Benchmark * 0.025; break;
            case "SSD":
                gamingScore += storage.Benchmark * 0.1; break;
        }

        return gamingScore;
    }

    static calculateWorkScore(cpu, gpu, ram, storage){
        let workScore = 0;
        //CPU 性能 60%、GPU 性能 25%、RAM 10%、ストレージ 5%
        workScore += cpu.Benchmark * 0.6;
        workScore += gpu.Benchmark * 0.25;
        workScore += ram.Benchmark * 0.1;
        workScore += storage.Benchmark * 0.05;

        return workScore;
    }
}

class View{
    static setInitPage(){
        //画面の初期化
        config.target.innerHTML = ``;
        config.target.classList.add("bg-light", "p-3");//後で考える
        //タイトル画面のセット
        View.setTitlePage();
        //選択画面とボタンのセット
        View.setSelectPage();
        View.setButton();
        //fetch関数でデータの取得と選択肢の設定
        View.setOptionsByFetch();
        //イベントリスナーのセット
        View.setEventListener();
    }

    //title画面のセット
    static setTitlePage(){
        //後で画面の微調整がしやすくするためそのまま書いた
        config.target.innerHTML += `
            <div class="bg-secondary text-white text-center p-2">
                <h1><i class="fas fa-desktop mr-2"></i>Build Your Own Computer</h1>
            </div>
        `;
    }

    //select画面のセット
    static setSelectPage(){
        //後で画面の微調整がしやすくするためそのまま書いた
        config.target.innerHTML += `
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
    }

    //ボタンの生成
    static setButton(){
        config.target.innerHTML += `
            <div class="d-flex pb-4">
                <button type="button" class="btn btn-primary col-3 col-md-2" id="buildButton">Add PC</button>
                <p class="text-danger col-9 mt-2">クリックされると以下に結果を表示</p>
            </div>
            <div id="result">
            </div>
        `;
    }

    //fetchで選択肢をセット
    static setOptionsByFetch(){
        View.setSelect1();
        View.setSelect2();
        View.setSelect3();
        View.setSelect4();
    }

    static setSelect1(){
        //select1のセット
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
        //select2のセット
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
        //select3のセット
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
        //select4のセット
        //各ストレージパーツのセット
        fetch(config.url + "hdd").then(response => response.json()).then(data => {
            Controller.setStorageParts(data);
            let select4 = config.target.querySelectorAll("#select4")[0];
            let option1 = select4.querySelectorAll("#option1")[0];
            option1.innerHTML = `<option selected>-</option>`;
            option1.innerHTML += ` <option value="HDD">HDD</option>`;
        });
        fetch(config.url + "ssd").then(response => response.json()).then(data => {
            Controller.setStorageParts(data);
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
            //テスト用
            /*cpuModel = "Core i9-10900K";
            gpuModel = "Radeon-VII";
            ramModel = "Vengeance LPX DDR4 3000 C15 4x4GB";
            storageModel = "XPG SX8200 NVMe PCIe M.2 960GB";//*/


            if(![cpuModel, gpuModel, ramModel, storageModel].includes("-")){
                console.log("ベンチマークを計算して表示");
                //各パーツをモデルから取得
                let cpu = Controller.getParts(cpuModel);
                let gpu = Controller.getParts(gpuModel);
                let ram = Controller.getParts(ramModel);
                let storage = Controller.getParts(storageModel);
                //各バーツからベンチマークを計算
                let gamingScore = Controller.calculateGamingScore(cpu, gpu, ram, storage);
                let workScore = Controller.calculateWorkScore(cpu, gpu, ram, storage);
                console.log(gamingScore);
                console.log(workScore);
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
                        <p class="col-5">work: ${workScore}%</h>
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

//主に画面の起動、modelとviewのデータを繋ぐ役割
class Controller{
    //画面の起動
    static startPage(){
        View.setInitPage();
    }

    static setCpuParts(parts){
        Model.setCpuParts(parts);
    }

    static setGpuParts(parts){
        Model.setGpuParts(parts);
    }

    static setRamParts(parts){
        Model.setRamParts(parts);
    }

    static setStorageParts(parts){
        Model.setStorageParts(parts);
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

    static calculateGamingScore(cpu, gpu, ram, storage){
        return Model.calculateGamingScore(cpu, gpu, ram, storage);
    }

    static calculateWorkScore(cpu, gpu, ram, storage){
        return Model.calculateWorkScore(cpu, gpu, ram, storage);
    }
}

//画面起動
Controller.startPage();