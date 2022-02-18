// ESM
import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.23/vue.esm-browser.min.js';

let productModal; // 產品 modal 
let delProductModal; // 刪除 modal

const app = createApp({
  // 資料
  data(){
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/",  // API 網址
      apiPath: "bingbingboom",  // 申請的 API Path
      temp: {},
      products: [],
      pagesInfo: {},
      newProduct: false,
    }
  },

  // 生命週期
  mounted() {
    // 取出 token
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    // console.log(token);

    // 設定預設夾帶 headers 驗證資訊
    axios.defaults.headers.common['Authorization'] = token;

    // 確認是否登入
    this.checkLogin();

    // 建立 modal 實體
    productModal = new bootstrap.Modal(document.querySelector('#productModal'));
    delProductModal = new bootstrap.Modal(document.querySelector('#delProductModal'));  
  },

  // 方法
  methods: {
    // 確認是否登入
    checkLogin(){
      axios.post(`${this.apiUrl}/v2/api/user/check`)
      .then((res) => {
        // console.log(res);
        // 未成功登入
        if(!res.data.success){
          alert(res.data.message);
          // 轉址 - 回到登入頁面
          window.location = "login.html";
        }

        // 登入成功，取得產品資料
        this.getData();
      })
      .catch((err) => {
        console.dir(err);
        window.location = "login.html";
      })
    },

    // 取得產品列表
    getData(page = 1){
      axios.get(`${this.apiUrl}/v2/api/${this.apiPath}/admin/products?page=${page}`)
        .then((res) => {
          this.products = res.data.products;
          this.pagesInfo = res.data.pagination;
        })
        .catch((err) => {
          console.dir(err);
        })
    },

    // 啟用 未啟用
    changeEnabled(item){
      item.is_enabled = !item.is_enabled;
    },

    // 打開 modal 
    openModal(todo, item){
      if(todo === 'new'){
        // console.log('建立產品 Modal');
        this.newProduct = true;
        this.temp = {};
        productModal.show();
      }else if(todo === 'edit'){
        // console.log('編輯產品 Modal');
        this.newProduct = false;
        productModal.show();
        this.temp = {...item};
      }else if(todo === 'del'){
        // console.log('刪除產品 Modal');
        delProductModal.show();
        // console.log({...item});
        this.temp = {...item};
      }
    },

    // 更新產品
    updateProduct(id){
      if(this.newProduct){
        // console.log('新增產品');
        axios.post(`${this.apiUrl}/v2/api/${this.apiPath}/admin/product`,{
          data: this.temp
        })
          .then((res) => {
            alert(res.data.message);
            this.getData();
            productModal.hide();
          })
          .catch((err) => {
            alert(err.data.message);
          })
      }else{
        // console.log('編輯產品');
        axios.put(`${this.apiUrl}/v2/api/${this.apiPath}/admin/product/${id}`,{
          data: this.temp
        })
          .then((res) => {
            alert(res.data.message);
            this.getData();
            productModal.hide();
          })
          .catch((err) => {
            alert(err.data.message);
          })
      }
    },

    // 刪除產品
    delProduct(id){
      // console.log(id);
      axios.delete(`${this.apiUrl}/v2/api/${this.apiPath}/admin/product/${id}`)
        .then((res) => {
          alert(res.data.message);
          delProductModal.hide();
          this.getData();
          this.temp = {};
        })
        .catch((err) => {
          alert(err.data.message);
        })
    },
  }
});

// 分頁元件
app.component('pagination', {
  props:['pageInfo'],
  template: `<nav aria-label="Page navigation example">
    <ul class="pagination">
      <li class="page-item" :class="{ 'disabled': !pageInfo.has_pre }">
        <a class="page-link" href="#" aria-label="Previous" @click="$emit('get-products', pageInfo.current_page-1)">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      <li class="page-item" v-for="page in pageInfo.total_pages" :key="'page'+page" :class="{ 'active': page === pageInfo.current_page }"><a class="page-link" href="#" @click="$emit('get-products', page)">{{ page }}</a></li>
      <li class="page-item" :class="{ 'disabled': !pageInfo.has_next }">
        <a class="page-link" href="#" aria-label="Next" @click="$emit('get-products', pageInfo.current_page+1)">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  </nav>`,
})

// 刪除產品 Modal 元件
app.component('delProductModal', {
  props:['tempProduct'],
  template: `<div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0">
      <div class="modal-header bg-danger text-white">
        <h5 id="delProductModalLabel" class="modal-title">
          <span>刪除產品</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        是否刪除
        <strong class="text-danger">{{ tempProduct.title }}</strong> 商品(刪除後將無法恢復)。
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
          取消
        </button>
        <button type="button" class="btn btn-danger" @click="$emit('del-product', tempProduct.id)">
          確認刪除
        </button>
      </div>
    </div>
  </div>`,
})

// 新增、編輯產品 Modal 元件
app.component('productModal', {
  props: ['tempProduct'],
  methods: {
    // 新增圖片
    addImages(){
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push('');
    },
  },
  template: `<div class="modal-dialog modal-xl modal-dialog-centered">
    <div class="modal-content border-0">
      <div class="modal-header bg-dark text-white">
        <h5 id="productModalLabel" class="modal-title">
          <span v-if="tempProduct.title === undefined">新增產品</span>
          <span v-else>編輯產品</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-sm-4">
            <div class="mb-3">
              <h6>主要圖片</h6>
              <div class="mb-3">
                <label for="imageUrl" class="form-label">輸入圖片網址</label>
                <input type="text" id="imageUrl" class="form-control"
                      placeholder="請輸入圖片連結" v-model="tempProduct.imageUrl">
              </div>
              <img class="img-fluid" :src="tempProduct.imageUrl" :alt="tempProduct.title">
            </div>
            <div>
              <h6>多圖新增</h6>
              <div v-if="Array.isArray(tempProduct.imagesUrl)">
                <div class="mb-1" v-for="(image, key) in tempProduct.imagesUrl" :key="'tempImg'+key">
                  <label for="image" class="form-label">圖片網址</label>
                  <input type="text" id="image" class="form-control" placeholder="請輸入圖片連結" v-model="tempProduct.imagesUrl[key]">
                  <img class="img-fluid" :src="image">
                </div>
                <div>
                  <button class="btn btn-outline-primary btn-sm d-block w-100" @click="tempProduct.imagesUrl.push('')">
                    新增圖片
                  </button>
                  <button class="btn btn-outline-danger btn-sm d-block w-100" @click="tempProduct.imagesUrl.pop()">
                    刪除圖片
                  </button>
                </div>
              </div>
              <button v-else class="btn btn-outline-primary btn-sm d-block w-100" @click="addImages">
                新增圖片
              </button>
            </div>
            <div>
            </div>
          </div>
          <div class="col-sm-8">
            <div class="mb-3">
              <label for="title" class="form-label">標題</label>
              <input id="title" type="text" class="form-control" placeholder="請輸入標題" v-model="tempProduct.title">
            </div>

            <div class="row">
              <div class="mb-3 col-md-6">
                <label for="category" class="form-label">分類</label>
                <input id="category" type="text" class="form-control" placeholder="請輸入分類" v-model="tempProduct.category">
              </div>
              <div class="mb-3 col-md-6">
                <label for="price" class="form-label">單位</label>
                <input id="unit" type="text" class="form-control" placeholder="請輸入單位" v-model="tempProduct.unit">
              </div>
            </div>

            <div class="row">
              <div class="mb-3 col-md-6">
                <label for="origin_price" class="form-label">原價</label>
                <input id="origin_price" type="number" min="0" class="form-control" placeholder="請輸入原價" v-model="tempProduct.origin_price">
              </div>
              <div class="mb-3 col-md-6">
                <label for="price" class="form-label">售價</label>
                <input id="price" type="number" min="0" class="form-control" placeholder="請輸入售價" v-model="tempProduct.price">
              </div>
            </div>
            <hr>

            <div class="mb-3">
              <label for="description" class="form-label">產品描述</label>
              <textarea id="description" type="text" class="form-control" placeholder="請輸入產品描述" v-model="tempProduct.description">
              </textarea>
            </div>
            <div class="mb-3">
              <label for="content" class="form-label">說明內容</label>
              <textarea id="description" type="text" class="form-control" placeholder="請輸入說明內容" v-model="tempProduct.content">
              </textarea>
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input id="is_enabled" v-model="tempProduct.is_enabled" class="form-check-input" type="checkbox"
                      :true-value="1" :false-value="0">
                <label class="form-check-label" for="is_enabled">是否啟用</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
          取消
        </button>
        <button type="button" class="btn btn-primary" @click="$emit('update-product', tempProduct.id)">
          確認
        </button>
      </div>
    </div>
  </div>`,
})

app.mount('#app');