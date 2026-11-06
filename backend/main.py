from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

import models, auth, payments, products_data
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Doce Mila Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRegisterSchema(BaseModel):
    nome: str
    email: str
    senha: str
    telefone: Optional[str] = None

class UserLoginSchema(BaseModel):
    email: str
    senha: str

class CheckoutSchema(BaseModel):
    user_id: int
    total_valor: float
    email_cliente: str
    nome_cliente: str
    tipo_entrega: str = "retirada"

@app.get("/api/products")
def get_products():
    return products_data.PRODUCTS

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def registrar(data: UserRegisterSchema, db: Session = Depends(get_db)):
    user_exists = db.query(models.User).filter(models.User.email == data.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado!")
    
    novo_user = models.User(
        nome=data.nome,
        email=data.email,
        senha_hash=auth.hash_senha(data.senha),
        telefone=data.telefone
    )
    db.add(novo_user)
    db.commit()
    db.refresh(novo_user)
    return {"message": "Usuário cadastrado com sucesso!"}

@app.post("/api/auth/login")
def login(data: UserLoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth.verificar_senha(data.senha, user.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")
    
    token = auth.criar_token_acesso({"sub": user.email, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "nome": user.nome, "email": user.email}
    }

@app.post("/api/checkout/pix")
def checkout_pix(data: CheckoutSchema, db: Session = Depends(get_db)):
    novo_pedido = models.Order(
        user_id=data.user_id,
        total_valor=data.total_valor,
        tipo_entrega=data.tipo_entrega
    )
    db.add(novo_pedido)
    db.commit()
    db.refresh(novo_pedido)

    dados_pix = payments.gerar_pagamento_pix(
        order_id=novo_pedido.id,
        valor_total=data.total_valor,
        email_cliente=data.email_cliente,
        nome_cliente=data.nome_cliente
    )

    novo_pedido.payment_id = str(dados_pix["payment_id"])
    db.commit()

    return {
        "pedido_id": novo_pedido.id,
        "pix": dados_pix
    }
