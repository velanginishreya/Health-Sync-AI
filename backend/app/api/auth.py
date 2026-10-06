from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, PatientProfile, UserRole
from app.schemas.schemas import UserRegister, UserLogin, Token, UserOut
from app.utils.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
def register(user_in: UserRegister, request: Request, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        phone=user_in.phone,
        date_of_birth=user_in.date_of_birth,
        gender=user_in.gender
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if user.role == UserRole.PATIENT:
        profile = PatientProfile(user_id=user.id)
        db.add(profile)
        db.commit()

    AuditService.log(db, action="REGISTER", resource_type="User", user_id=user.id, ip_address=request.client.host if request.client else None)
    return user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    AuditService.log(db, action="LOGIN", resource_type="User", user_id=user.id, ip_address=request.client.host if request.client else None)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role.value,
        user_id=user.id,
        name=f"{user.first_name} {user.last_name}"
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    AuditService.log(db, action="LOGOUT", resource_type="User", user_id=current_user.id)
    return {"message": "Logged out successfully"}
