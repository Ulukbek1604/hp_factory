from django import forms
from django.conf import settings
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import RawMaterial, Employee, FinishedProduct, Credit, CreditPayment


class PurchaseForm(forms.Form):
    """Форма закупки сырья"""
    material = forms.ModelChoiceField(
        queryset=RawMaterial.objects.all(),
        label='Сырье',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    quantity = forms.FloatField(
        label='Количество',
        min_value=0.01,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': 'Количество'})
    )
    sum_amount = forms.DecimalField(
        max_digits=18,
        decimal_places=2,
        label='Сумма (сом)',
        min_value=0.01,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': 'Сумма'})
    )
    employee = forms.ModelChoiceField(
        queryset=Employee.objects.all(),
        label='Ответственный сотрудник',
        widget=forms.Select(attrs={'class': 'form-select'}),
        required=False
    )


class ProductionForm(forms.Form):
    """Форма производства продукции"""
    product = forms.ModelChoiceField(
        queryset=FinishedProduct.objects.all(),
        label='Готовая продукция',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    quantity = forms.FloatField(
        label='Количество (шт/кг)',
        min_value=0.01,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'})
    )
    employee = forms.ModelChoiceField(
        queryset=Employee.objects.all(),
        label='Ответственный сотрудник',
        widget=forms.Select(attrs={'class': 'form-select'}),
        required=False
    )


class SaleForm(forms.Form):
    """Форма продажи продукции"""
    product = forms.ModelChoiceField(
        queryset=FinishedProduct.objects.all(),
        label='Готовая продукция',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    quantity = forms.FloatField(
        label='Количество',
        min_value=0.01,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'})
    )
    sum_amount = forms.DecimalField(
        max_digits=18, decimal_places=2, label='Сумма от продажи (Выручка)',
        min_value=0.01, widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'})
    )
    employee = forms.ModelChoiceField(
        queryset=Employee.objects.all(),
        label='Ответственный сотрудник',
        widget=forms.Select(attrs={'class': 'form-select'}),
        required=False
    )


class SalaryPaymentForm(forms.Form):
    """Форма выдачи зарплаты"""
    employee = forms.ModelChoiceField(
        queryset=Employee.objects.all(),
        label='Сотрудник',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    amount = forms.DecimalField(
        max_digits=18, decimal_places=2, label='Сумма выплаты',
        min_value=0.01, widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'})
    )


class CreditForm(forms.Form):
    """Форма получения кредита"""
    amount = forms.DecimalField(
        max_digits=18, decimal_places=2, label='Сумма кредита',
        min_value=0.01, widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'})
    )
    interest_rate = forms.DecimalField(
        max_digits=5, decimal_places=2, label='Процентная ставка (%)',
        required=False, widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'})
    )
    term_months = forms.IntegerField(
        label='Срок кредита (месяцев)',
        required=False, min_value=1, max_value=360,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )
    start_date = forms.DateField(
        label='Дата получения',
        required=False, widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        help_text='Если не указано, будет использована текущая дата'
    )

class CreditPaymentForm(forms.Form):
    """Форма погашения кредита"""
    credit = forms.ModelChoiceField(
        queryset=Credit.objects.filter(status__in=['active', None]),
        label='Кредит',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    amount = forms.DecimalField(
        max_digits=18, decimal_places=2, label='Сумма выплаты',
        min_value=0.01, widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'})
    )
    payment_type = forms.ChoiceField(
        choices=CreditPayment.PAYMENT_TYPE_CHOICES,
        label='Тип платежа',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    note = forms.CharField(
        label='Примечание',
        required=False,
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
    )


# ============================================================
# ФОРМЫ БЕЗОПАСНОСТР (Практическая работа №3)
# ============================================================

class RegisterForm(UserCreationForm):
    """Публичная форма регистрации (только обычный пользователь)."""
    email = forms.EmailField(
        required=True,
        label='Email',
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'your@email.com'})
    )
    first_name = forms.CharField(
        max_length=100,
        required=True,
        label='Имя',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Имя'})
    )
    last_name = forms.CharField(
        max_length=100,
        required=True,
        label='Фамилия',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Фамилия'})
    )

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Логин'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].widget.attrs.update({'class': 'form-control', 'placeholder': '••••••••'})
        self.fields['password2'].widget.attrs.update({'class': 'form-control', 'placeholder': '••••••••'})
        self.fields['password1'].label = 'Пароль'
        self.fields['password2'].label = 'Подтверждение пароля'
        self.fields['username'].label = 'Логин'

        # Генерируем список требований к паролю на основе AUTH_PASSWORD_VALIDATORS
        self.password_requirements = []
        for validator_conf in settings.AUTH_PASSWORD_VALIDATORS:
            validator_name = validator_conf.get('NAME', '')
            options = validator_conf.get('OPTIONS', {})
            if 'MinimumLengthValidator' in validator_name:
                min_len = options.get('min_length', 8)
                self.password_requirements.append(f'Минимальная длина: не менее {min_len} символов')
            elif 'UserAttributeSimilarityValidator' in validator_name:
                self.password_requirements.append('Не должен содержать ваше имя, фамилию или email')
            elif 'CommonPasswordValidator' in validator_name:
                self.password_requirements.append('Не должен быть распространенным паролем (например, "123456", "password")')
            elif 'NumericPasswordValidator' in validator_name:
                self.password_requirements.append('Не должен состоять только из цифр')
            # Для кастомных хешеров (например, SHA384/512) добавим общую рекомендацию
            elif 'SHA384PasswordHasher' in validator_name or 'SHA512PasswordHasher' in validator_name:
                self.password_requirements.append('Хотя бы одна заглавная и одна строчная буква')

    def save(self, commit=True):
        user = super().save(commit=False)
        # Публичная регистрация: всегда обычный пользователь.
        user.is_superuser = False
        user.is_staff = False
        if commit:
            user.save()
        return user


class LoginForm(AuthenticationForm):
    """Форма входа в систему."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Логин'})
        self.fields['password'].widget.attrs.update({'class': 'form-control', 'placeholder': '••••••••'})
        self.fields['username'].label = 'Логин'
        self.fields['password'].label = 'Пароль'


class ProfileEditForm(forms.ModelForm):
    """Форма редактирования профиля пользователя"""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']
        labels = {
            'first_name': 'Имя',
            'last_name': 'Фамилия',
            'email': 'Email',
        }
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
        }


class ProductionRequestForm(forms.Form):
    """Форма создания заявки на производство."""
    product = forms.ModelChoiceField(
        queryset=FinishedProduct.objects.all(),
        label='Продукция',
        widget=forms.Select(attrs={'class': 'form-select'}),
        help_text='Выберите вид продукции для изготовления.'
    )
    quantity = forms.FloatField(
        label='Количество (шт.)',
        min_value=1,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '1', 'placeholder': 'Например: 5'}),
        help_text='Укажите необходимое количество единиц продукции.'
    )
    applicant_full_name = forms.CharField(
        label='ФИО заявителя',
        max_length=150,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Например: Иванов Иван Иванович'}),
        help_text='Укажите ФИО заявителя.'
    )


