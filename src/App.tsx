import React, { useEffect, useState } from 'react'
import './App.css'
import { IUser } from './types'

const App: React.FC = (): React.ReactElement => {
	const [users, setUsers] = useState<IUser[]>([])
	const [checkedUsers, setCheckedUsers] = useState<Set<number>>(new Set([]))
	const [showEditModal, setShowEditModal] = useState<boolean>(false)
	const [searchTerm, setSearchTerm] = useState<string>('')

	const [editId, setEditId] = useState<number>(NaN)
	const [editName, setEditName] = useState<string>('')
	const [editEmail, setEditEmail] = useState<string>('')
	const [editRole, setEditRole] = useState<string>('')

	const [currentPage, setCurrentPage] = useState<number>(1)
	const usersPerPage = 10

	const getUsers = async () => {
		const url =
			'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json'
		const res = await fetch(url)
		const data: IUser[] = await res.json()
		setUsers(data)
	}

	useEffect(() => {
		getUsers()
	}, [])

	const toggleCheck = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
		const checked = new Set(checkedUsers)
		e.target.checked ? checked.add(id) : checked.delete(id)
		setCheckedUsers(checked)
	}

	const toggleAllCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			const checked = new Set(currentUsers.map((u: IUser) => u.id))
			setCheckedUsers(checked)
		} else {
			setCheckedUsers(new Set([]))
		}
	}

	const handleDelete = (id: number) => {
		const updatedUsers: IUser[] = users.filter((u: IUser) => u.id !== id)
		setUsers(updatedUsers)
	}

	const handleEdit = (
		id: number,
		name: string,
		email: string,
		role: string
	) => {
		setEditId(id)
		setShowEditModal(true)
		setEditName(name)
		setEditEmail(email)
		setEditRole(role)
	}

	const handleValuesChange = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		e.preventDefault()
		const newUsers = users.map((u: IUser) => {
			if (u.id === editId) {
				return {
					id: editId,
					name: editName,
					email: editEmail,
					role: editRole,
				}
			} else return u
		})
		setUsers(newUsers)
		setShowEditModal(false)
	}

	const getFilteredUsers = (users: IUser[], filterKey: string): IUser[] => {
		const filteredRows = users.filter((u: IUser) =>
			Object.values(u).some(s =>
				('' + s).toLowerCase().includes(filterKey.toLowerCase())
			)
		)
		return filteredRows
	}

	const handleDeleteSelected = () => {
		const newUsers = users.filter((u: IUser) => !checkedUsers.has(u.id))
		setUsers(newUsers)
		setCheckedUsers(new Set([]))
	}

	const filteredUsers = getFilteredUsers(users, searchTerm)

	const idxOfLastUser = currentPage * usersPerPage
	const idxOfFirstUser = idxOfLastUser - usersPerPage
	const currentUsers = filteredUsers.slice(idxOfFirstUser, idxOfLastUser)

	const pageNumbers: number[] = []
	for (let i = 1; i <= Math.ceil(filteredUsers.length / usersPerPage); i++) {
		pageNumbers.push(i)
	}

	const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCurrentPage(pageNumbers[0])
		setSearchTerm(e.target.value)
	}

	return (
		<div className='App'>
			<input
				type='text'
				value={searchTerm}
				onChange={e => handleSearchTermChange(e)}
				className='App__searchTerm'
				placeholder='Seach by name, email or role'
				autoFocus
				style={{ width: '20rem' }}
			/>
			<button disabled={!checkedUsers.size} onClick={handleDeleteSelected}>
				Deleted selected
			</button>
			{showEditModal && (
				<div className='App__modal' onClick={e => setShowEditModal(false)}>
					<div className='App__modalContent' onClick={e => e.stopPropagation()}>
						<input
							type='text'
							value={editName}
							onChange={e => setEditName(e.target.value)}
							autoFocus
						/>
						<input
							type='text'
							value={editEmail}
							onChange={e => setEditEmail(e.target.value)}
						/>
						<input
							type='text'
							value={editRole}
							onChange={e => setEditRole(e.target.value)}
						/>
						<button onClick={e => handleValuesChange(e)}>Edit</button>
					</div>
				</div>
			)}
			<table>
				<thead>
					<tr>
						<th>
							<input
								type='checkbox'
								checked={
									checkedUsers.size === currentUsers.length &&
									checkedUsers.size !== 0
								}
								onChange={e => toggleAllCheck(e)}
							/>
						</th>
						<th>Name</th>
						<th>Email</th>
						<th>Role</th>
						<th colSpan={2}>Actions</th>
					</tr>
				</thead>
				<tbody>
					{currentUsers.map((u: IUser) => {
						const { id, name, email, role } = u
						return (
							<tr
								key={id}
								className={`row ${checkedUsers.has(id) ? 'check' : ''}`}
							>
								<td>
									<input
										type='checkbox'
										id={`${id}`}
										checked={checkedUsers.has(id)}
										onChange={e => toggleCheck(e, id)}
									/>
								</td>
								<td>{name}</td>
								<td>{email}</td>
								<td>{role}</td>
								<td
									style={{ cursor: 'pointer' }}
									onClick={() => handleEdit(id, name, email, role)}
								>
									-- Edit --
								</td>
								<td
									style={{ cursor: 'pointer' }}
									onClick={() => handleDelete(id)}
								>
									-- Delete --
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			<div className='App__pagination'>
				<button onClick={() => setCurrentPage(pageNumbers[0])}>&lt;&lt;</button>
				<button
					disabled={currentPage === 1}
					onClick={() => setCurrentPage(currentPage => currentPage - 1)}
				>
					&lt;
				</button>
				{pageNumbers.map((num: number) => {
					return (
						<button
							key={num}
							className={`${currentPage === num ? 'bright' : ''}`}
							onClick={() => setCurrentPage(num)}
						>
							{num}
						</button>
					)
				})}
				<button
					disabled={currentPage === pageNumbers.at(-1)}
					onClick={() => setCurrentPage(currentPage => currentPage + 1)}
				>
					&gt;
				</button>
				<button onClick={() => setCurrentPage(pageNumbers.at(-1)!)}>
					&gt;&gt;
				</button>
			</div>
		</div>
	)
}

export default App
