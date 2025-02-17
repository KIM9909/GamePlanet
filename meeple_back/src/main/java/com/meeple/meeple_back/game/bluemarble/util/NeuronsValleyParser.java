package com.meeple.meeple_back.game.bluemarble.util;

import com.meeple.meeple_back.game.bluemarble.domain.CardType;
import com.meeple.meeple_back.game.bluemarble.domain.NeuronsValleyCard;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class NeuronsValleyParser implements ExcelReader<NeuronsValleyCard> {

	private static final AtomicInteger counter = new AtomicInteger(20000);

	@Override
	public List<NeuronsValleyCard> readExcelFile() {
		List<NeuronsValleyCard> cards = new ArrayList<>();

		try (InputStream fis = getClass().getResourceAsStream("/game-element/neurons-valley.xlsx");
				Workbook workbook = new XSSFWorkbook(fis)) {

			Sheet sheet = workbook.getSheetAt(0);
			Iterator<Row> rowIterator = sheet.iterator();

			// 첫 번째 행(헤더) 건너뛰기
			rowIterator.next();

			while (rowIterator.hasNext()) {
				Row row = rowIterator.next();
				if (Objects.isNull(row.getCell(0))) {
					continue;
				}
				int number = (int) row.getCell(1).getNumericCellValue();
				String name = row.getCell(2).getStringCellValue();
				String description = row.getCell(3).getStringCellValue();
				if (number == 1 || number == 2 || number == 14) {
					for (int i = 0; i < 7; i++) {
						cards.add(new NeuronsValleyCard(counter.getAndIncrement(), number, name,
								CardType.NEURONS_VALLEY_CARD, description));
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		Collections.shuffle(cards);
		return cards;
	}
}
