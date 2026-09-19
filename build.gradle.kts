tasks.register<Exec>("npmBuild") {
    commandLine("npm", "run", "build")
}

tasks.register("assembleDebug") {
    dependsOn("npmBuild")
    doLast {
        println("Web application built successfully for Vercel/Vite.")
    }
}
