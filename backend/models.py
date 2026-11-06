from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    telefone = Column(String(20), nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_valor = Column(Float, nullable=False)
    status = Column(String(50), default="pendente") # pendente, pago, cancelado
    payment_id = Column(String(100), nullable=True)
    tipo_entrega = Column(String(50), default="retirada") # retirada, entrega
    criado_em = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
