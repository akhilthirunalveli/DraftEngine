from fastapi import HTTPException, status

class CredentialsException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

class NotFoundException(HTTPException):
    def __init__(self, detail="Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class PermissionDeniedException(HTTPException):
    def __init__(self, detail="Not authorized"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class GeminiAPIException(HTTPException):
    def __init__(self, detail="AI Service unavailable"):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)