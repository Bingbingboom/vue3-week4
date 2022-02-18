// ESM
import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.23/vue.esm-browser.min.js';

const app = {
  // 資料
  data(){
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/",  // API 網址
      apiPath: "bingbingboom",  // 申請的 API Path
      userInfo: {
        username: '',
        password: ''
      }
    }
  },

  // 生命週期
  created(){

  },

  // 方法
  methods: {
    login(){
      axios.post(`${this.apiUrl}/v2/admin/signin`, this.userInfo)
        .then((res) => {
          console.log(res);
          if(!res.data.success){
            alert(res.data.error.message);
            return;
          }
          /* 回傳訊息
            expired: unix timestamp － token 的使用期限
            message: 登入成功訊息
            token: 再次登入時會使用到ㄉ，驗證是同一個人，可以不需再次發送帳密
          */
          
          // 取出 token 和 expired 並存到 Cookie 中
          const { token, expired } = res.data;
    
          /* https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie#%E7%A4%BA%E4%BE%8B2_%E5%BE%97%E5%88%B0%E5%90%8D%E4%B8%BAtest2%E7%9A%84cookie
    
            document.cookie = "someCookieName=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/"; 
            someCookieName: 為自定義名稱，把 cookie 存起來時要使用什麼名稱。後方的值為 token
            expires: 為一般的時間格式，所以需使用 new Date 將取出的 expired 轉換格式
          */
          document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;

          // 轉址 - 進入產品列表頁
          window.location="index.html";
        })
        .catch((err) => {
          console.dir(err);
        })
    }
  }
}

createApp(app).mount('#app');