from app.models import PaymentMethod, Transaction, TransactionStatus, TransactionType
from app import db
import secrets

def create_transaction(data):
    try:
        transaction = Transaction(
            identifier=f"TXN-{secrets.token_hex(8)}",
            booking_id=data['booking_id'],
            amount=data['amount'],
            payment_method=PaymentMethod(data['payment_method']),
            status=TransactionStatus.SUCCESS,
            type=TransactionType.PAYMENT,
        )

        db.session.add(transaction)
        db.session.commit()

        return transaction, None
    except Exception as e:
        db.session.rollback()
        return None, str(e)

def get_transaction(transaction_id):
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return None, "Transaction not found"
    return transaction, None

def get_all_transactions(status=None, booking_id=None):
    query = Transaction.query
    
    if status:
        query = query.filter_by(status=TransactionStatus(status))
    if booking_id:
        query = query.filter_by(booking_id=booking_id)
    
    return query.order_by(Transaction.created_at.desc()).all()

def update_transaction_status(transaction_id, new_status):
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return None, "Transaction not found"
    
    try:
        transaction.status = TransactionStatus(new_status)
        db.session.commit()
        return transaction, None
    except Exception as e:
        db.session.rollback()
        return None, str(e)