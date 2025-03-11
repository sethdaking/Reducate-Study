'use client'
import { useUser } from '@clerk/nextjs'
import React, { useEffect } from 'react'
import axios from 'axios'
import { USER_TABLE } from '../configs/schema';
import { db } from '../configs/db';

function Provider({children}) {

    const {user} = useUser();

    useEffect(() => {
        user&&CheckIsNewUser();
    }, [user])

    const CheckIsNewUser = async ()=>{
        // Check if User already exists
        {/*const result = await db.select().from(USER_TABLE)
        .where(eq(USER_TABLE.email, user?.primaryEmailAddress?.emailAddress))

        console.log(result)

        if(result?.length === 0){
            // If Not add to Databse
            const UserResponse = await db.insert(USER_TABLE).values({
                name: user?.fullName,
                email: user?.primaryEmailAddress?.emailAddress,
            }).returning({id:USER_TABLE?.id})

        } */}

        const resp = await axios.post('/api/create-user', {user: user});
        console.log(resp.data);



    }

    return (
        <div>
            {children}
        </div>
    )
}

export default Provider