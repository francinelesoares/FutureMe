// EMAILJS
emailjs.init("SUA_PUBLIC_KEY");

// CONFIG FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCtps-qF0eg61hPokgcHT5XPQF2uDJPUm4",
    authDomain: "futureme-7886f.firebaseapp.com",
    projectId: "futureme-7886f",
    storageBucket: "futureme-7886f.firebasestorage.app",
    messagingSenderId: "1070764793185",
    appId: "1:1070764793185:web:adfcbbc490799e5d26b920",
    measurementId: "G-Z2BLVL72MD"
};

// INICIAR FIREBASE
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const lista = document.getElementById("lista-cartas");

// SALVAR CARTA
async function salvarCarta(){

    let mensagem = document.getElementById("mensagem").value;
    let data = document.getElementById("data").value;

    if(mensagem === "" || data === ""){
        alert("Preencha todos os campos!");
        return;
    }

    let usuario = auth.currentUser;

    if(!usuario){
        alert("Faça login primeiro!");
        return;
    }

    try{

        let docRef = await db.collection("cartas").add({
            mensagem: mensagem,
            data: data,
            userId: usuario.uid,
            email: usuario.email,
            criadoEm: new Date()
        });

        let carta = {
            id: docRef.id,
            mensagem: mensagem,
            data: data,
            userId: usuario.uid,
            email: usuario.email
        };

        mostrarCarta(carta);

        enviarEmail(mensagem, data);

        alert("Carta salva!");

        document.getElementById("mensagem").value = "";
        document.getElementById("data").value = "";

    }catch(error){

        console.log(error);
        alert("Erro ao salvar carta.");

    }
}

// MOSTRAR CARTA
function mostrarCarta(carta){

    let novaCarta = document.createElement("div");

    novaCarta.classList.add("carta");

    novaCarta.innerHTML = `
        <h3>${carta.data}</h3>

        <p>${carta.mensagem}</p>

        <button class="btn-editar" onclick="editarCarta('${carta.id}', \`${carta.mensagem}\`)">
            Editar
        </button>

        <button class="btn-excluir" onclick="removerCarta('${carta.id}')">
            Excluir
        </button>
    `;

    lista.appendChild(novaCarta);
}

// CARREGAR CARTAS
async function carregarCartasFirestore(){

    lista.innerHTML = "";

    let usuario = auth.currentUser;

    if(!usuario){
        return;
    }

    try{

        let snapshot = await db
        .collection("cartas")
        .where("userId", "==", usuario.uid)
        .get();

        snapshot.forEach((doc) => {

            let carta = {
                id: doc.id,
                ...doc.data()
            };

            mostrarCarta(carta);
        });

    }catch(error){

        console.log(error);

    }
}

// EXCLUIR CARTA
async function removerCarta(id){

    try{

        await db.collection("cartas").doc(id).delete();

        await carregarCartasFirestore();

    }catch(error){

        console.log(error);
        alert("Erro ao excluir carta.");

    }
}

// EDITAR CARTA
async function editarCarta(id, mensagemAtual){

    let novaMensagem = prompt("Edite sua mensagem:", mensagemAtual);

    if(novaMensagem === null || novaMensagem === ""){
        return;
    }

    try{

        await db.collection("cartas").doc(id).update({
            mensagem: novaMensagem
        });

        await carregarCartasFirestore();

    }catch(error){

        console.log(error);
        alert("Erro ao editar carta.");

    }
}

// CADASTRO
function cadastrar(){

    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;

    auth.createUserWithEmailAndPassword(email, senha)

    .then(() => {

        alert("Conta criada com sucesso!");

        carregarCartasFirestore();

    })

    .catch((error) => {

        if(error.code === "auth/email-already-in-use"){
            alert("Esse email já está cadastrado!");
        }else if(error.code === "auth/weak-password"){
            alert("A senha precisa ter pelo menos 6 caracteres.");
        }else if(error.code === "auth/invalid-email"){
            alert("Digite um email válido.");
        }else{
            alert("Erro ao cadastrar.");
        }

    });
}

// LOGIN
function login(){

    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;

    auth.signInWithEmailAndPassword(email, senha)

    .then(() => {

        alert("Login realizado!");

        carregarCartasFirestore();

    })

    .catch((error) => {

        if(error.code === "auth/user-not-found"){
            alert("Usuário não encontrado.");
        }else if(error.code === "auth/wrong-password"){
            alert("Senha incorreta.");
        }else if(error.code === "auth/invalid-email"){
            alert("Email inválido.");
        }else{
            alert("Erro ao fazer login.");
        }

    });
}

// RESETAR SENHA
function resetarSenha(){

    let email = document.getElementById("email").value;

    if(email === ""){
        alert("Digite seu email primeiro.");
        return;
    }

    auth.sendPasswordResetEmail(email)

    .then(() => {

        alert("Email de recuperação enviado!");

    })

    .catch((error) => {

        if(error.code === "auth/user-not-found"){
            alert("Usuário não encontrado.");
        }else if(error.code === "auth/invalid-email"){
            alert("Email inválido.");
        }else{
            alert("Erro ao enviar email.");
        }

    });
}

// ALTERAR ENTRE LOGIN E CADASTRO
let modoCadastro = false;

function mostrarCadastro(){

    modoCadastro = !modoCadastro;

    let titulo = document.getElementById("auth-title");
    let botao = document.getElementById("btn-auth");
    let texto = document.querySelector(".auth-text");

    if(modoCadastro){

        titulo.innerText = "Criar conta";
        botao.innerText = "Cadastrar";
        botao.setAttribute("onclick", "cadastrar()");

        texto.innerHTML = `
            Já tem conta?
            <span onclick="mostrarCadastro()">Entrar</span>
        `;

    }else{

        titulo.innerText = "Entrar";
        botao.innerText = "Entrar";
        botao.setAttribute("onclick", "login()");

        texto.innerHTML = `
            Não tem conta?
            <span onclick="mostrarCadastro()">Cadastre-se</span>
        `;
    }
}

// TEMA DARK/LIGHT
let botaoTema = document.getElementById("toggle-theme");

let temaSalvo = localStorage.getItem("tema");

if(temaSalvo === "light"){

    document.body.classList.add("light");
    botaoTema.innerHTML = "☀️";

}

botaoTema.addEventListener("click", function(){

    document.body.classList.toggle("light");

    if(document.body.classList.contains("light")){

        localStorage.setItem("tema", "light");
        botaoTema.innerHTML = "☀️";

    }else{

        localStorage.setItem("tema", "dark");
        botaoTema.innerHTML = "🌙";

    }
});

// EMAIL
function enviarEmail(mensagem, data){

    let usuario = auth.currentUser;

    if(!usuario){
        return;
    }

    let parametros = {
        mensagem: mensagem,
        data: data,
        para_email: usuario.email
    };

    emailjs.send(
        "SEU_SERVICE_ID",
        "SEU_TEMPLATE_ID",
        parametros
    )

    .then(() => {
        console.log("Email enviado!");
    })

    .catch((error) => {
        console.log(error);
    });
}

// SERVICE WORKER
if("serviceWorker" in navigator){

    navigator.serviceWorker
    .register("sw.js")
    .then(() => {
        console.log("Service Worker registrado!");
    });

}

// MANTER USUÁRIO LOGADO
auth.onAuthStateChanged((usuario) => {

    if(usuario){
        carregarCartasFirestore();
    }

});