const express=require('express'),
      fetch=require('node-fetch'),
      redis=require('redis'),
      PORT=process.env.PORT||5000,
      REDIS_PORT=process.env.REDIS_PORT||6379,
      app=express()

const client=redis.createClient(REDIS_PORT)


function setResponse(username,repos){
    return `<h2>${username} has ${repos} github repositories</h2>`
}

async function getRepos(req,res,next){
    try{

    console.log('Fetching ...')

    const {username} =await req.params

    const response=await fetch(`https://api.github.com/users/${username}`)

    const data= await response.json()

    const repos=data.public_repos

    client.setex(username,3600, repos)

    // res.send(setResponse(username,repos))


    }catch(err){
        console.log(err)
        res.status(500)
    }
}


function cache(req,res,next){
    const {username}=req.params

    client.get(username,(err,data)=>{
        if(err) throw err

        if(data !== null){
            res.send(setResponse(username,data))
        }else{
            next()
        }


    })

}


app.get('/redis/:username',cache,getRepos)

app.listen(PORT,()=>{
    console.log(`server started on ${PORT}`)
})