'use client'
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/hooks/useDictionary";
import { User } from "@/components/icons";

export default function Home() {
  const {user, logout, loading} = useAuth()
  const { dictionary, loading: dictLoading } = useDictionary();
  
  if(loading || dictLoading) return <h1>{dictionary?.common?.loading || 'Loading...'}</h1>
  return (
    <div className="">
        
      {user ?
      <>
      <div className="flex flex-col items-center mt-10 h-auto p-6 ml-auto mr-auto border-2 border-white">
        <h1 className="text-4xl font-bold text-center ">Welcome {user.displayName}</h1>
        <div className="p-3 border-2 border-gray-500 w-screen ">
          {user.photoURL ? (
            <Image src={user.photoURL} alt="user" className="rounded-full" width={80} height={80} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-600" />
            </div>
          )}
          <p className="">Name: {user.displayName}</p>
          <p className="">Email:{user.email}</p>
          <p className="">UID:{user.uid}</p>
          <p className="">Email Verified:{user.emailVerified}</p>
          <p className="">Photo URL:{user.photoURL?.slice(0, 10)}...</p>
          <p  className="overflow-x-auto relative w-full" >Token:{user.token}</p>
        </div>
        <Button className="bg-amber-200 text-black hover:bg-amber-300 hover:text-white" onClick={() => logout()}>Sign Out</Button>
      </div>
      </> : <h1>Please login</h1>}
    </div>
  );
}
