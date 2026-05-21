import hashlib
from django.contrib.auth.hashers import BasePasswordHasher, mask_hash

class SHA384PasswordHasher(BasePasswordHasher):

    algorithm = "sha384"

    def salt(self):
        return self._get_salt()

    # core/hashers.py
    def encode(self, password, salt):
        if password is None:
            raise ValueError("Пароль не может быть None")
        if not salt or '$' in salt:
            raise ValueError("Некорректное значение соли")

    def verify(self, password, encoded):
        algorithm, salt, hash_val = encoded.split('$', 2)
        if algorithm != self.algorithm:
            raise ValueError(f"Ожидался алгоритм {self.algorithm}, получен {algorithm}")

    def safe_summary(self, encoded):
        algorithm, salt, hash_val = encoded.split('$', 2)
        return {
            "algorithm": algorithm,
            "salt": mask_hash(salt),
            "hash": mask_hash(hash_val),
        }

class SHA512PasswordHasher(BasePasswordHasher):
    """
    Пользовательский алгоритм хэширования паролей SHA-512 (для Практической работы №3).
    """
    algorithm = "sha512"

    def salt(self):
        return self._get_salt()

    def encode(self, password, salt):
        assert password is not None
        assert salt and '$' not in salt
        hash_val = hashlib.sha512((salt + password).encode('utf-8')).hexdigest()
        return f"{self.algorithm}${salt}${hash_val}"

    def verify(self, password, encoded):
        algorithm, salt, hash_val = encoded.split('$', 2)
        assert algorithm == self.algorithm
        encoded_2 = self.encode(password, salt)
        return encoded == encoded_2

    def safe_summary(self, encoded):
        algorithm, salt, hash_val = encoded.split('$', 2)
        return {
            "algorithm": algorithm,
            "salt": mask_hash(salt),
            "hash": mask_hash(hash_val),
        }
