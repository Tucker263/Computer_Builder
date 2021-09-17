const config = {
    target: document.getElementById("target"),
    url: "https://api.recursionist.io/builder/computers?type="
};

class Model{
    static cpuParts = [];
    static gpuParts = [];
    static ramParts = [];
    static hddParts = [];
    static ssdParts = [];

    //セッター関数
    //pcの各パーツをセット、セットは一度きり
    static setCpuParts(parts){
        Model.cpuParts = parts;
        Object.freeze(Model.cpuParts);
    }

    static setGpuParts(parts){
        Model.gpuParts = parts;
        Object.freeze(Model.gpuParts);
    }

    static setRamParts(parts){
        Model.ramParts = parts;
        Object.freeze(Model.ramParts);
    }

    static setHddParts(parts){
        Model.hddParts = parts;
        Object.freeze(Model.hddParts);
    }

    static setSsdParts(parts){
        Model.ssdParts = parts;
        Object.freeze(Model.ssdParts);
    }

    //ゲッター関数
    //cpuのブランド配列を取得
    static getCpuBrands(){
        let cpuBrands = Model.cpuParts.map(cpu => cpu.Brand);
        return Model.removeDuplicateInArr(cpuBrands);
    }

    //cpuのモデル配列をcpuのブランドから取得
    static getCpuModels(cpuBrand){
        return Model.cpuParts
                    .filter(cpu => cpu.Brand === cpuBrand)
                    .map(cpu => cpu.Model);
    }

    //gpuのブランド配列を取得
    static getGpuBrands(){
        let gpuBrands = Model.gpuParts.map(gpu => gpu.Brand);
        return Model.removeDuplicateInArr(gpuBrands);
    }

    //gpuのモデル配列をgpuのブランドから取得
    static getGpuModels(gpuBrand){
        return Model.gpuParts
                    .filter(gpu => gpu.Brand === gpuBrand)
                    .map(gpu => gpu.Model);
    }

    //ramの本数(amount)配列を取得
    static getRamAmounts(){
        let ramAmounts = Model.ramParts.map(ram => Model.getRamAmount(ram));
        return Model.removeDuplicateInArr(ramAmounts);
    }

    //ramの本数(amount)を取得
    static getRamAmount(ram){
        let stringArr = ram.Model.split(" ");
        let string = stringArr[stringArr.length - 1];
        return string.substring(0, string.indexOf("x"));
    }

    //ramのブランド配列をramの本数(amount)から取得
    static getRamBrands(ramAmount){
        let ramBrands = Model.ramParts
                            .filter(ram => Model.getRamAmount(ram) === ramAmount)
                            .map(ram => ram.Brand);
        return Model.removeDuplicateInArr(ramBrands);
    }

    //ramのモデル配列をramの本数(amount)とブランドから取得
    static getRamModels(ramAmount, ramBrand){
        return Model.ramParts
                    .filter(ram => Model.getRamAmount(ram) === ramAmount)
                    .filter(ram => ram.Brand === ramBrand)
                    .map(ram => ram.Model);
    }

    //hddのストレージ配列を取得
    static getHddStorages(){
        let gbArr = Model.getBiteArr(Model.hddParts, "GB");
        let tbArr = Model.getBiteArr(Model.hddParts, "TB");
        return tbArr.concat(gbArr);
    }

    //ssdのストレージ配列を取得
    static getSsdStorages(){
        let gbArr = Model.getBiteArr(Model.ssdParts, "GB");
        let tbArr = Model.getBiteArr(Model.ssdParts, "TB");
        return tbArr.concat(gbArr);
    }

    //Biteの配列をパーツ配列とタイプ(TBかGB)から取得
    static getBiteArr(storageParts, type){
        let biteArr = storageParts.map(parts => parts.Model)
                                .filter(model => model.includes(type))
                                .map(model => Model.getBitefromModel(model, type))
                                .sort((a, b) => b - a)
                                .map(amount => amount + type);
        return Model.removeDuplicateInArr(biteArr);
    }

    //Biteをモデルとタイプから取得
    static getBitefromModel(model, type){
        let biteString = model.split(" ")
                              .filter(string => string.includes(type))
                              .join("");
        let atBite = biteString.indexOf(type);
        return biteString.substring(0, atBite);
    }

    ////hddのブランド配列をbiteから取得
    static getHddBrands(hddBite){
        let hddBrands = Model.hddParts
                            .filter(hdd => hdd.Model.includes(hddBite))
                            .map(hdd => hdd.Brand);
        return Model.removeDuplicateInArr(hddBrands);
    }

    //ssdのブランド配列をbiteから取得
    static getSsdBrands(ssdBite){
        let ssdBrands = Model.ssdParts
                            .filter(ssd => ssd.Model.includes(ssdBite))
                            .map(ssd => ssd.Brand);
        return Model.removeDuplicateInArr(ssdBrands);
    }

    //hddのモデル配列をbiteとブランドから取得
    static getHddModels(hddBite, hddBrand){
        return Model.hddParts
                    .filter(hdd => hdd.Model.includes(hddBite))
                    .filter(hdd => hdd.Brand === hddBrand)
                    .map(hdd => hdd.Model);
    }

    //ssdのモデル配列をbiteとブランドから取得
    static getSsdModels(ssdBite, ssdBrand){
        return Model.ssdParts
                    .filter(ssd => ssd.Model.includes(ssdBite))
                    .filter(ssd => ssd.Brand === ssdBrand)
                    .map(ssd => ssd.Model);
    }

    //各パーツをモデルから取得
    static getCpu(cpuModel){
        return Model.cpuParts.filter(cpu => cpu.Model === cpuModel)[0];
    }

    static getGpu(gpuModel){
        return Model.gpuParts.filter(gpu => gpu.Model == gpuModel)[0];
    }

    static getRam(ramModel){
        return Model.ramParts.filter(ram => ram.Model === ramModel)[0];
    }

    static getHdd(hddModel){
        return Model.hddParts.filter(hdd => hdd.Model === hddModel)[0];
    }

    static getSsd(ssdModel){
        return Model.ssdParts.filter(ssd => ssd.Model === ssdModel)[0];
    }

    static calculateGamingScore(cpu, gpu, ram, storage){
        let gamingScore = 0;
        gamingScore += cpu.Benchmark * 0.25;
        gamingScore += gpu.Benchmark * 0.6;
        gamingScore += ram.Benchmark * 0.125;

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

    //配列の重複を削除
    static removeDuplicateInArr(arr){
        let output = [];
        let hashmap = {};
        arr.forEach(value => hashmap[value] = value);
        for(let key in hashmap) output.push(key);
        return output;
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
            let cpuBrands = Controller.getCpuBrands();
            cpuBrands.forEach(cpuBrand => {
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
            let gpuBrands = Controller.getGpuBrands();
            gpuBrands.forEach(gpuBrand => {
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
            let ramAmounts = Controller.getRamAmounts();
            ramAmounts.forEach(ramAmount => {
                option1.innerHTML += `<option value="${ramAmount}">${ramAmount}</option>`;
            });
        });
    }

    static setSelect4(){
        //select4のセット
        //hddのセット
        fetch(config.url + "hdd").then(response => response.json()).then(data => {
            Controller.setHddParts(data);
            let select4 = config.target.querySelectorAll("#select4")[0];
            let option1 = select4.querySelectorAll("#option1")[0];
            option1.innerHTML = `<option selected>-</option>`;
            option1.innerHTML += ` <option value="HDD">HDD</option>`;
        });
        //ssdのセット
        fetch(config.url + "ssd").then(response => response.json()).then(data => {
            Controller.setSsdParts(data);
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
                let cpuModels = Controller.getCpuModels(option1.value);
                cpuModels.forEach(cpuModel => {
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
                let gpuModels = Controller.getGpuModels(option1.value);
                gpuModels.forEach(gpuModel => {
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
                let ramBrands = Controller.getRamBrands(option1.value);
                ramBrands.forEach(ramBrand => {
                    option2.innerHTML += `<option value="${ramBrand}">${ramBrand}</option>`;
                });
            }
        });
        //option2の設定
        option2.addEventListener("change", () => {
            option3.innerHTML = `<option selected>-</option>`;
            if(option2.value !== "-"){
                let ramModels = Controller.getRamModels(option1.value, option2.value);
                ramModels.forEach(ramModel => {
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
            let storages = [];
            switch(option1.value){
                case "HDD":
                    storages = Controller.getHddStorages(); break;
                case "SSD":
                    storages = Controller.getSsdStorages(); break;
            }
            storages.forEach(bite => {
                option2.innerHTML += `<option value="${bite}">${bite}</option>`;
            });
        });
        //option2の設定
        option2.addEventListener("change", () => {
            option3.innerHTML = `<option selected>-</option>`;
            option4.innerHTML = `<option selected>-</option>`;
            let brands = [];
            switch(option1.value){
                case "HDD":
                    brands = Controller.getHddBrands(option2.value); break;
                case "SSD":
                    brands = Controller.getSsdBrands(option2.value); break;
            }
            brands.forEach(brand => {
                option3.innerHTML += `<option value="${brand}">${brand}</option>`;
            });
        });
        //option3の設定
        option3.addEventListener("change", () => {
            option4.innerHTML = `<option selected>-</option>`;
            let models = [];
            switch(option1.value){
                case "HDD":
                    models = Controller.getHddModels(option2.value, option3.value); break;
                case "SSD":
                    models = Controller.getSsdModels(option2.value, option3.value); break;
            }
            models.forEach(model => {
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
            storageModel = "XPG SX8200 NVMe PCIe M.2 960GB";*/


            if(![cpuModel, gpuModel, ramModel, storageModel].includes("-")){
                console.log("ベンチマークを計算して表示");
                //各パーツをモデルから取得
                let cpu = Controller.getCpu(cpuModel);
                let gpu = Controller.getGpu(gpuModel);
                let ram = Controller.getRam(ramModel);
                let storage = {};
                let storageType = config.target
                                        .querySelectorAll("#select4")[0]
                                        .querySelectorAll("#option1")[0]
                                        .value;

                //テスト用
                //storageType = "SSD";

                switch(storageType){
                    case "HDD":
                        storage = Controller.getHdd(storageModel); break;
                    case "SSD":
                        storage = Controller.getSsd(storageModel); break;
                }
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

//主に画面の開始、modelとviewのデータを繋ぐ
class Controller{
    //画面のスタート
    static startPage(){
        View.setInitPage();
    }

    //セッター関数
    //PCパーツをセット、セットは一度きり
    static setCpuParts(parts){
        Model.setCpuParts(parts);
    }

    static setGpuParts(parts){
        Model.setGpuParts(parts);
    }

    static setRamParts(parts){
        Model.setRamParts(parts);
    }

    static setHddParts(parts){
        Model.setHddParts(parts);
    }

    static setSsdParts(parts){
        Model.setSsdParts(parts);
    }
    
    //ゲッター関数
    //cpuのブランド配列を取得
    static getCpuBrands(){
        return Model.getCpuBrands();
    }

    //cpuのモデル配列をcpuブランドから取得
    static getCpuModels(cpuBrand){
        return Model.getCpuModels(cpuBrand);
    }

    //gpuのブランド配列を取得
    static getGpuBrands(){
        return Model.getGpuBrands();
    }

    //gpuのモデル配列をgpuブランドから取得
    static getGpuModels(gpuBrand){
        return Model.getGpuModels(gpuBrand);
    }

    //ramの本数(amount)配列を取得
    static getRamAmounts(){
        return Model.getRamAmounts();
    }

    //ramのブランド配列をramの本数(amount)から取得
    static getRamBrands(ramAmount){
        return Model.getRamBrands(ramAmount);
    }

    //ramのモデル配列をramの本数(amount)とブランドから取得
    static getRamModels(ramAmount, ramBrand){
        return Model.getRamModels(ramAmount, ramBrand);
    }

    //hddのストレージ配列を取得
    static getHddStorages(){
        return Model.getHddStorages();
    }

    //ssdのストレージ配列を取得
    static getSsdStorages(){
        return Model.getSsdStorages();
    }

    //hddのブランド配列をbiteから取得
    static getHddBrands(hddBite){
        return Model.getHddBrands(hddBite);
    }

    //ssdのブランド配列をbiteから取得
    static getSsdBrands(ssdBite){
        return Model.getSsdBrands(ssdBite);
    }

    //hddのモデル配列をbiteとブランドから取得
    static getHddModels(hddBite, hddBrand){
        return Model.getHddModels(hddBite, hddBrand);
    }

    //ssdのモデル配列をbiteとブランドから取得
    static getSsdModels(ssdBite, ssdBrand){
        return Model.getSsdModels(ssdBite, ssdBrand);
    }

    //各パーツをモデルから取得
    static getCpu(cpuModel){
        return Model.getCpu(cpuModel);
    }

    static getGpu(gpuModel){
        return Model.getGpu(gpuModel);
    }

    static getRam(ramModel){
        return Model.getRam(ramModel);
    }

    static getHdd(hddModel){
        return Model.getHdd(hddModel);
    }

    static getSsd(ssdModel){
        return Model.getSsd(ssdModel);
    }

    static calculateGamingScore(cpu, gpu, ram, storage){
        return Model.calculateGamingScore(cpu, gpu, ram, storage);
    }

    static calculateWorkScore(cpu, gpu, ram, storage){
        return Model.calculateWorkScore(cpu, gpu, ram, storage);
    }
}

//スタート
Controller.startPage();
