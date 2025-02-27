import {create} from "zustand"
import {axiosInstance} from "../lib/axios.js"

export const useAuthStore=create((set)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdateingProfile:false,
    isCheckingAuth :true,

    checkAuth: async()=>{
        try{
            const res=await axiosInstance.get("/auth/check") 
            
            set({authUser:res.data})
        }catch(err){
            console.log("Error in checkAuth",err)
            set({authUser:null})
        }finally{
            set({isCheckingAuth:false})
        }
    }

    // signup:async(data)=>{

    // }
}))