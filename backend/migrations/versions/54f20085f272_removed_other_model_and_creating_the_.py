"""Removed other model and creating the Destination Model

Revision ID: 54f20085f272
Revises: 2b7652ee178b
Create Date: 2025-07-01 15:41:54.023000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '54f20085f272'
down_revision = '2b7652ee178b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('destinations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('air', sa.Boolean(), nullable=False),
    sa.Column('couch', sa.Boolean(), nullable=False),
    sa.Column('train', sa.Boolean(), nullable=False),
    sa.Column('status', sa.Enum('ACTIVE', 'INACTIVE', name='globalstatus'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('destinations')
    # ### end Alembic commands ###
