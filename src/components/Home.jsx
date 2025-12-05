import Jumbotron from "./templates/Jumbotron.jsx";

export default function Home() {
	return (
		<>
			<Jumbotron
				subject="BidHouse"
				detail="최신 경매 정보와 인기 아이템을 만나보세요!"
			/>

			<div className="container mt-5">

				{/* 최근 게시글 */}
				<section className="mb-5">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<h3>최근 게시글</h3>
						<a href="/posts" className="text-secondary text-decoration-none">
							더보기 <i className="fa-solid fa-arrow-right"></i>
						</a>
					</div>
					<div className="row">
						{[1, 2, 3, 4].map((post) => (
							<div className="col-md-3 mb-3" key={post}>
								<div className="card h-100 shadow-sm">
									<img src={`https://picsum.photos/300/200?random=${post}`} className="card-img-top" alt="게시글 이미지" />
									<div className="card-body">
										<h5 className="card-title text-truncate">게시글 제목 {post}</h5>
										<p className="card-text text-truncate">간단한 내용 요약이 들어갑니다. Lorem ipsum dolor sit amet...</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* 인기 게시글 */}
				<section className="mb-5">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<h3>인기 게시글</h3>
						<a href="/popular" className="text-secondary text-decoration-none">
							더보기 <i className="fa-solid fa-arrow-right"></i>
						</a>
					</div>
					<ul className="list-group">
						{["NFT 경매 안내", "이번주 추천 아이템", "신규 입찰 방법", "공지사항 업데이트"].map((item, idx) => (
							<li className="list-group-item d-flex justify-content-between align-items-center" key={idx}>
								{item}
								<span className="badge bg-primary rounded-pill">{Math.floor(Math.random() * 1000)}</span>
							</li>
						))}
					</ul>
				</section>

				{/* 추천 경매 아이템 */}
				<section className="mb-5">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<h3>추천 경매 아이템</h3>
						<a href="/auctions" className="text-secondary text-decoration-none">
							더보기 <i className="fa-solid fa-arrow-right"></i>
						</a>
					</div>
					<div className="row">
						{[1, 2, 3, 4].map((item) => (
							<div className="col-md-3 mb-3" key={item}>
								<div className="card h-100 shadow-sm">
									<img src={`https://picsum.photos/300/200?random=${item + 10}`} className="card-img-top" alt="아이템 이미지" />
									<div className="card-body d-flex flex-column">
										<h5 className="card-title text-truncate">아이템 {item}</h5>
										<p className="card-text text-truncate">현재 입찰가: {Math.floor(Math.random() * 5000)} 원</p>
										<a href={`/auction/${item}`} className="btn btn-outline-primary mt-auto">입찰하기</a>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* 명예의 전당 */}
				<section className="mb-5">
					<h3 className="mb-3">명예의 전당</h3>
					<ul className="list-group">
						{[
							{ rank: 1, name: "BlazeMaster", point: 15000 },
							{ rank: 2, name: "ShadowFox", point: 12000 },
							{ rank: 3, name: "NeoHunter", point: 11000 },
							{ rank: 4, name: "StarGazer", point: 8500 },
							{ rank: 5, name: "PixelKing", point: 5200 },
						].map(user => (
							<li className="list-group-item d-flex justify-content-between" key={user.rank}>
								<span>
									<span className="badge bg-primary">{user.rank}</span> {user.name}
								</span>
								<span>{user.point.toLocaleString()} point</span>
							</li>
						))}
					</ul>
				</section>

			</div>
		</>
	)
}
