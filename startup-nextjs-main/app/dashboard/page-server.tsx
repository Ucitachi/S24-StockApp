'use server'
 
import { redirect } from 'next/navigation';

export async function navigate(stock) {
    console.log("yes it's here")
  redirect(`/Sell?stock=${stock}`);

}
// redirect(`/Buy?stock=${stock}`)