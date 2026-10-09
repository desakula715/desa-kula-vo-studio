const presets={
 documentary:"Speak in Indonesian as an adult documentary narrator. Calm, authoritative, grounded and natural. Use clear articulation, a measured medium-slow pace, controlled emotion, and meaningful pauses between ideas. Do not sound like a radio announcer.",
 investigative:"Speak in Indonesian as a serious investigative documentary narrator. Firm, controlled and slightly suspenseful, never theatrical or angry. Build curiosity with measured pacing and deliberate emphasis on questions and key facts.",
 news:"Speak in Indonesian as a professional documentary news narrator. Clear, objective, crisp pronunciation of numbers and policy terms, medium pace, no exaggerated announcer delivery.",
 storytelling:"Speak in Indonesian as a warm, natural documentary storyteller. Engaging and conversational but precise and professional. Use gentle emphasis and meaningful pauses.",
 critical:"Speak in Indonesian as a serious, sharp editorial documentary narrator. Critical and authoritative without sounding angry. Emphasize facts, contrasts and questions naturally."
};
export default async function handler(req,res){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Gunakan metode POST."})}
 const key=process.env.OPENAI_API_KEY;
 if(!key)return res.status(500).json({error:"OPENAI_API_KEY belum diatur di Environment Variables hosting."});
 const {text,style="documentary",voice="marin",speed=0.92}=req.body||{};
 if(typeof text!=="string"||!text.trim())return res.status(400).json({error:"Naskah wajib diisi."});
 if(text.length>4096)return res.status(400).json({error:"Naskah maksimal 4.096 karakter per generate."});
 const voices=new Set(["marin","cedar","onyx","verse","sage"]);
 const selectedVoice=voices.has(voice)?voice:"marin";
 const selectedStyle=presets[style]||presets.documentary;
 const selectedSpeed=Math.max(0.75,Math.min(1.15,Number(speed)||0.92));
 try{
  const api=await fetch("https://api.openai.com/v1/audio/speech",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-4o-mini-tts",voice:selectedVoice,input:text,instructions:selectedStyle,response_format:"mp3",speed:selectedSpeed})});
  if(!api.ok){const data=await api.json().catch(()=>({}));return res.status(api.status).json({error:data?.error?.message||"Provider TTS gagal membuat audio."})}
  const audio=Buffer.from(await api.arrayBuffer());res.setHeader("Content-Type","audio/mpeg");res.setHeader("Content-Disposition",'inline; filename="desa-kula-vo.mp3"');res.setHeader("Cache-Control","no-store");return res.status(200).send(audio);
 }catch{return res.status(500).json({error:"Tidak dapat menghubungi layanan TTS. Coba lagi."})}
}
